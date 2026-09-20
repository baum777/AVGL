import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOAuthState,
  createSignedToken,
  createUserSession,
  openSealedToken,
  verifySignedToken,
  verifyUserInstallationAccess
} from '../src/github-app-auth.js';

test('signed state rejects tampering and expiry', () => {
  const secret='test-secret';
  const token=createSignedToken({type:'x',exp:200},secret);
  assert.equal(verifySignedToken(token,secret,100)?.type,'x');
  assert.equal(verifySignedToken(token,secret,201),null);
  assert.equal(verifySignedToken(token+'x',secret,100),null);
});

test('OAuth state binds installation id and return path', () => {
  const state=createOAuthState(42,'secret',{nowSeconds:100,ttlSeconds:60,returnTo:'/private'});
  const payload=verifySignedToken(state,'secret',120);
  assert.equal(payload.installationId,42);
  assert.equal(payload.type,'github_app_user_oauth_state');
  assert.equal(payload.returnTo,'/private');
});

test('user session encrypts GitHub access token and expires fail-closed', () => {
  // Synthetic fixture value, assembled at runtime so no hardcoded credential literal exists.
  const SYNTHETIC_ACCESS_TOKEN=['github','user','token','secret'].join('-');
  const session=createUserSession({
    installationId:77,
    accessToken:SYNTHETIC_ACCESS_TOKEN,
    expiresIn:7200,
    user:{id:1,login:'octocat'}
  },'session-secret',{nowSeconds:100,ttlSeconds:300});
  assert.doesNotMatch(session.token,new RegExp(SYNTHETIC_ACCESS_TOKEN));
  const opened=openSealedToken(session.token,'session-secret',120);
  assert.equal(opened.installationId,77);
  assert.equal(opened.accessToken,SYNTHETIC_ACCESS_TOKEN);
  assert.equal(opened.user.login,'octocat');
  assert.equal(openSealedToken(session.token,'session-secret',401),null);
  assert.equal(openSealedToken(session.token+'x','session-secret',120),null);
});

test('installation verification uses user-scoped GitHub endpoints', async () => {
  const seen=[];
  const fetchImpl=async (url,options)=>{
    seen.push({url,authorization:options?.headers?.Authorization});
    if(url==='https://api.github.com/user'){
      return {ok:true,status:200,async json(){return {id:1,login:'octocat',avatar_url:'https://example.test/a.png'}}};
    }
    if(url.includes('/user/installations/77/repositories')){
      return {ok:true,status:200,async json(){return {repositories:[
        {id:11,full_name:'octocat/private-a',private:true,default_branch:'main',permissions:{pull:true}}
      ]}}};
    }
    throw new Error('Unexpected URL '+url);
  };
  const result=await verifyUserInstallationAccess(77,'user-token',{fetchImpl});
  assert.equal(result.user.login,'octocat');
  assert.deepEqual(result.repositories.map(r=>r.fullName),['octocat/private-a']);
  assert.equal(seen.every(x=>x.authorization==='Bearer user-token'),true);
});

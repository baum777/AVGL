import mongoose from 'mongoose';

export const UserModel = mongoose.model('User', userSchema);

export function buildRoute() {
  const planner = new RoutePlanner();
  const note = 'project planning';
  const reasoning = 'layout reasoning for the documentation page';
  return { planner, note, reasoning };
}

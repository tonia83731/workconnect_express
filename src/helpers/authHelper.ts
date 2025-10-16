export const isSelf = (tokenUserId: string, targetUserId: string) => {
  return tokenUserId === targetUserId;
};

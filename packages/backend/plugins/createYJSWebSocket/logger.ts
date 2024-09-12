export const logger = (...args: any[]) => {
  const now = new Date();
  const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
  console.log(`${time} ${args.join(' ')}`);
}

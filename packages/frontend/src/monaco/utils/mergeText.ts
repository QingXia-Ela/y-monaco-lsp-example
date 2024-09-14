import { diffWords } from 'diff';

function mergeText(local: string, remote: string) {
  const diff = diffWords(local, remote, {});

  let result = [];

  for (let i = 0; i < diff.length; i++) {
    if (diff[i].added) {
      result.push(diff[i].value);
    } else if (diff[i].removed) {
      result.push(diff[i].value);
    } else if (diff[i].value) {
      result.push(diff[i].value);
    }
  }

  return result.join('');
}

// 示例用法
export default mergeText
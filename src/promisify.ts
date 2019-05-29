export default function promisify<T>(func: (...argArray: any[]) => Thenable<T>, thisArg?: any): (...argArray: any[]) => Promise<T> {
  return function (...argArray: any[]) {
    return new Promise<T>((resolve, reject) => {
      func.call(thisArg, ...argArray).then(
        result => resolve(result),
        error => reject(error)
      );
    });
  };
}

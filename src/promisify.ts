export default function promisify<T>(func: (...argArray: any[]) => Thenable<T>, thisArg?: any): (...argArray: any[]) => Promise<T> {
  return function<T>(...argArray: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      func.apply(thisArg, argArray).then(
        result => resolve(result),
        error => reject(error)
      );
    });
  };
}

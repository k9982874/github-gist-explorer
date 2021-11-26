export declare type PromiseFunction<T> = (...argArray: any[]) => void | T | Thenable<T>;

export default function promisify<T>(func: PromiseFunction<T>, thisArg?: any): (...argArray: any[]) => Promise<T> {
  return function<T>(...argArray: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      func.apply(thisArg, argArray).then(
        result => resolve(result),
        error => reject(error)
      );
    });
  };
}

type Procedure = (...args: any[]) => any;

interface IDebounce {
  (...args: any[]): any;
  clear: () => void;
  flush: () => void;
}

export default function (func: Procedure, wait: number, immediate?: boolean) {
  let timeout: NodeJS.Timer;
  let args: any;
  let context: any;
  let result: any;

  const later = () => {
    timeout = undefined;
    if (!immediate) {
      result = func.apply(context, args);
      context = args = undefined;
    }
  };

  const debouncedFunc: Procedure = function(this: any) {
    context = this;
    args = arguments;
    const callNow = immediate && !timeout;

    if (!timeout) {
      timeout = setTimeout(later, wait);
    }

    if (callNow) {
      result = func.apply(context, args);
      context = args = undefined;
    }

    return result;
  };

  const clear = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };

  const flush = () => {
    if (timeout) {
      result = func.apply(context, args);
      context = args = undefined;

      clearTimeout(timeout);
      timeout = undefined;
    }
  };

  const debounced: IDebounce = (() => {
    const f: any = debouncedFunc;
    f.clear = clear;
    f.flush = flush;
    return f;
  })();

  return debounced;
};

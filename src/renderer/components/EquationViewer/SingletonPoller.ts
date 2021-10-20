

let timer : ReturnType <typeof setInterval>;

export const getPoller = (f: () => void, interval : number) : ReturnType <typeof setInterval> => {
  if (!timer) {
    makePoller(f, interval);
  }
  return timer;
}

const makePoller = (f : () => void, interval : number) : void  => {
  timer = setInterval(f, interval);
}

export const destroyPoller = () : void => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

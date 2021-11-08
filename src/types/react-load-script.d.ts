declare module 'react-load-script' {
    
  // export interface Script  {
  //     attributes?: string[],
  //     onCreate: { (): void },
  //     onError: { (): void},
  //     onLoad: { (): void},
  //     url: string
  // }
  type Props = {
      attributes?: string[],
      onCreate: { (): void },
      onError: { (): void},
      onLoad: { (): void},
      url: string
  }
  
  const Script: FunctionComponent<Props>;
  export default Script;
}

declare module 'find-open-port' {
  function findPort () : Promise<number>;
  export default findPort;
}

declare module 'postscribe' {
  function postscribe (element : string, html : string, options?: any) : void;
  export default postscribe;
}
declare module 'react-native-zip-archive' {
  export function unzip(source: string, target: string, charset?: string): Promise<string>;
  export function zip(source: string | string[], target: string): Promise<string>;
  export function zipWithPassword(
    source: string | string[],
    target: string,
    password: string,
    encryptionType?: string
  ): Promise<string>;
  export function unzipWithPassword(source: string, target: string, password: string): Promise<string>;
  export function unzipAssets(assetPath: string, target: string): Promise<string>;
  export function subscribe(callback: (event: { progress: number; filePath: string }) => void): { remove(): void };
}

// use a custom header that is provided by the electron app, which we can read here and then return true/false for what platform it is
export const useElectronEnvironment = () => ({
  isMac: false,
  isWindows: false,
});

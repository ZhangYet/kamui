export function getScriptPath(rfile: string): string {
    var rscriptDir = __dirname.replace('out/commands', 'R/');
    return rscriptDir + rfile;
}

export function cleanWorkPath(path: string): string {
    const homedir = require('os').homedir();
    var cleanPath = path.replace('~', homedir);
    const resolvedPath = require('path').resolve(cleanPath);
    return resolvedPath;
}

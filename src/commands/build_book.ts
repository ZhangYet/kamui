import * as child from 'child_process'; 
import * as vscode from 'vscode';

export async function buildBook() {
    var path: string | undefined = await vscode.window.showInputBox({
        prompt: 'Enter bookdown project path.',
        validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "Bookdown path must not be empty",
    });
    if ( path === undefined ) {
        path = ".";
    }
    var args = [getScriptPath('build_book.R'), 'all', path];
    const s = child.spawn('Rscript', args);
    s.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    s.on('close', (code) => {
        if (code === 0) {
            vscode.window.showInformationMessage('compile finish');
        } else {
            vscode.window.showErrorMessage('you fail me');
        }
    });
}

function getScriptPath(rfile:string):string {
    var rscriptDir = __dirname.replace('out/commands', 'R/');
    return rscriptDir + rfile;
}
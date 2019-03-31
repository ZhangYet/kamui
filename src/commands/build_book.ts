import * as child from 'child_process'; 
import * as vscode from 'vscode';

export async function buildBook(context: vscode.ExtensionContext) {
    // get workdir and store workdir
    // TODO: a more elegant way to do so
    var defaultWorkDir = context.workspaceState.get<string>('defaultKamuiWorkDir');
    if ( defaultWorkDir === undefined ) {
        defaultWorkDir = '.';
    }
    var path: string | undefined = await vscode.window.showInputBox({
        prompt: 'Enter bookdown project path.',
        value: defaultWorkDir,
        validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "Bookdown path must not be empty",
    });
    context.workspaceState.update('defaultKamuiWorkDir', path);
    if ( path === undefined ) {
        path = '.';
    }

    // run the script and make process
    var incre = 0;
    var args = [getScriptPath('build_book.R'), 'all', path];
    const s = child.spawn('Rscript', args);
    s.stdout.on('data', (data) => {
        incre ++;
        console.log(`stdout: ${data}`);
        if ( incre % 20 === 0 ) {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Window,
			    title: "Bookdown is compiling...",
			    cancellable: true
            }, (progress, token) => {
                token.onCancellationRequested(() => {
                    s.send('close'); // terminate the compiling
                    console.log('User canceled the long running operation');
                });
                progress.report({increment: incre, message: data.toString()});
                var p = new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, 5000);
                });
                return p;
            });
        }
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
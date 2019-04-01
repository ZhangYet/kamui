import * as child from 'child_process';
import * as vscode from 'vscode';

import * as common from '../common';

export async function buildBook(context: vscode.ExtensionContext) {
    // get workdir and store workdir
    // TODO: a more elegant way to do so
    var defaultWorkDir = context.workspaceState.get<string>(common.DefaultWorkDirKey);
    if (defaultWorkDir === undefined) {
        defaultWorkDir = __dirname; // default working dir is local dir
    }
    var path: string | undefined = await vscode.window.showInputBox({
        prompt: 'Enter bookdown project path.',
        value: defaultWorkDir,
        validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "Bookdown path must not be empty",
    });
    context.workspaceState.update(common.DefaultWorkDirKey, path);
    if (path === undefined) {
        path = __dirname;
    }

    // run the script and make process
    var args = [getScriptPath('build_book.R'), 'all', path];
    const s = child.spawn('Rscript', args);


    var outputChannel = vscode.window.createOutputChannel(common.CompileOutputChannelName);
    outputChannel.show(true);
    s.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        outputChannel.appendLine(data.toString());
    });

    s.on('close', (code) => {
        if (code === 0) {
            vscode.window.showInformationMessage(common.BuildingSuccessfuleMsg);
            if (path !== undefined) {
                var openPath = cleanWorkPath(path) + common.OutputHtmlFile;
                console.log('parsedPath: ' + openPath);
                const open = require('open');
                open(openPath);
            }
        } else {
            vscode.window.showErrorMessage(common.BuildingFailedMsg);
        }
    });
}

function getScriptPath(rfile: string): string {
    var rscriptDir = __dirname.replace('out/commands', 'R/');
    return rscriptDir + rfile;
}

function cleanWorkPath(path: string): string {
    const homedir = require('os').homedir();
    var cleanPath = path.replace('~', homedir);
    const resolvedPath = require('path').resolve(cleanPath);
    return resolvedPath;
}

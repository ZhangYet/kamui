import * as vscode from "vscode";
import * as child from 'child_process';

import * as common from '../common';
import * as utils from './utils';

export class Kamui implements vscode.Disposable {

    private _defaultPath: string | undefined;
    private _logOutputChannel: vscode.OutputChannel;
    private _errOutputChannel: vscode.OutputChannel;


    constructor() {
        this._errOutputChannel = vscode.window.createOutputChannel(common.CompileErrorChannelName);
        this._logOutputChannel = vscode.window.createOutputChannel(common.CompileOutputChannelName);
    }

    public async buildBook() {
        // get working dir
        if (this._defaultPath === undefined) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders !== undefined && workspaceFolders.length <= 1) {
                this._defaultPath = workspaceFolders[0].uri.path;
            } else {
                this._defaultPath = require('os').homedir();
            }
        }
        var path: string | undefined = await vscode.window.showInputBox({
            prompt: 'Enter bookdown project path.',
            value: this._defaultPath,
            validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "Bookdown path must not be empty",
        });
        if (path === undefined) {
            path = __dirname;
        }
        this._defaultPath = path;

        // run the script and make process
        var args = [utils.getScriptPath('build_book.R'), 'all', path];
        const s = child.spawn('Rscript', args, { shell: true });

        this._logOutputChannel.show(true);
        s.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            this._logOutputChannel.appendLine(data.toString());
        });

        this._errOutputChannel.show(true);
        s.stderr.on('data', (data) => {
            this._errOutputChannel.show(true);
            this._errOutputChannel.append(data.toString());
        });

        s.on('close', (code) => {
            if (code === 0) {
                vscode.window.showInformationMessage(common.BuildingSuccessfuleMsg);
                if (path !== undefined) {
                    var openPath = utils.cleanWorkPath(path) + common.OutputHtmlFile;
                    const open = require('open');
                    open(openPath);
                }
            } else {
                vscode.window.showErrorMessage(common.BuildingFailedMsg);
            }
        });
    }

    public dispose() {
    }
}

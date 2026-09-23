import {useState} from 'react';
import {InstallDeb, SelectDebFile} from '../wailsjs/go/main/App';
import type {main} from '../wailsjs/go/models';

function App() {
    const [selectedPath, setSelectedPath] = useState('');
    const [status, setStatus] = useState<main.InstallResult | null>(null);
    const [isChoosing, setIsChoosing] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);

    async function chooseFile() {
        setIsChoosing(true);
        setStatus(null);
        try {
            const path = await SelectDebFile();
            if (path) {
                setSelectedPath(path);
            }
        } catch (error) {
            setStatus({success: false, message: String(error), output: ''});
        } finally {
            setIsChoosing(false);
        }
    }

    async function installPackage() {
        setIsInstalling(true);
        setStatus({success: false, message: 'Installing package...', output: ''});
        try {
            const result = await InstallDeb(selectedPath);
            setStatus(result);
        } catch (error) {
            setStatus({success: false, message: String(error), output: ''});
        } finally {
            setIsInstalling(false);
        }
    }

    return (
        <main className="h-screen overflow-hidden bg-slate-950 px-3 py-3 text-slate-100">
            <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-black/30">
                <section>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Ubuntu .deb installer</p>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            className="rounded-lg bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isChoosing || isInstalling}
                            onClick={chooseFile}
                            type="button"
                        >
                            {isChoosing ? 'Opening picker...' : 'Choose .deb file'}
                        </button>
                        <button
                            className="rounded-lg bg-emerald-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!selectedPath || isInstalling || isChoosing}
                            onClick={installPackage}
                            type="button"
                        >
                            {isInstalling ? 'Installing...' : 'Install / Reinstall'}
                        </button>
                    </div>

                    <div className="mt-3 rounded-lg bg-slate-900 p-3 text-left">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selected file</p>
                        <p className="mt-1 break-all font-mono text-xs text-slate-100">{selectedPath || 'No .deb file selected.'}</p>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                    <div className={`mt-2 rounded-lg border p-3 ${status?.success ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-700 bg-slate-900'}`}>
                        <p className="font-medium">{status?.message || 'Ready to install.'}</p>
                        {status?.output ? (
                            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-xs text-slate-200">{status.output}</pre>
                        ) : null}
                    </div>
                </section>
            </div>
        </main>
    )
}

export default App

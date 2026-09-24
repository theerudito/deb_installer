import {useState} from 'react';
import {InstallDeb, SelectDebFile} from '../wailsjs/go/main/App';
import type {main} from '../wailsjs/go/models';

function App() {
    const [selectedPath, setSelectedPath] = useState('');
    const [status, setStatus] = useState<main.InstallResult | null>(null);
    const [isChoosing, setIsChoosing] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [isResultOpen, setIsResultOpen] = useState(false);

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
        setStatus(null);
        setIsResultOpen(false);
        try {
            const result = await InstallDeb(selectedPath);
            setStatus(result);
            setIsResultOpen(true);
        } catch (error) {
            setStatus({success: false, message: String(error), output: ''});
            setIsResultOpen(true);
        } finally {
            setIsInstalling(false);
        }
    }

    function closeResult() {
        setIsResultOpen(false);
        setSelectedPath('');
        setStatus(null);
        setIsChoosing(false);
        setIsInstalling(false);
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

            {isInstalling ? (
                <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm" role="status" aria-live="polite">
                    <div className="installing-card flex w-full max-w-sm flex-col items-center rounded-2xl border border-cyan-400/30 bg-slate-900 p-8 text-center shadow-2xl shadow-black/50">
                        <span className="spinner" aria-hidden="true" />
                        <h2 className="mt-5 text-xl font-semibold text-slate-100">Installing package...</h2>
                        <p className="mt-2 text-sm text-slate-400">Please wait while the package is installed.</p>
                    </div>
                </div>
            ) : null}

            {isResultOpen && status ? (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
                    <div
                        aria-labelledby="installation-result-title"
                        aria-modal="true"
                        className="flex max-h-[min(36rem,calc(100vh-3rem))] w-full max-w-2xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50"
                        role="dialog"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Installation result</p>
                                <h2 id="installation-result-title" className="mt-1 text-xl font-semibold text-slate-100">{status.success ? 'Package installed successfully' : 'Package installation failed'}</h2>
                            </div>
                            <button
                                aria-label="Close installation result"
                                className="rounded-lg p-2 text-xl leading-none text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                                onClick={closeResult}
                                type="button"
                            >
                                ×
                            </button>
                        </div>
                        <div className="overflow-y-auto p-5">
                            <p className={status.success ? 'font-medium text-emerald-300' : 'font-medium text-rose-300'}>{status.message}</p>
                            {status.output ? (
                                <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-black/40 p-4 text-xs text-slate-200">{status.output}</pre>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </main>
    )
}

export default App

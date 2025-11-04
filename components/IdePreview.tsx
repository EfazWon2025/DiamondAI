import React from 'react';
import { Icon } from './Icon.tsx';

const CodeLine: React.FC<{ number: number; children?: React.ReactNode }> = ({ number, children }) => (
    <div className="flex text-sm">
        <span className="w-10 text-right pr-4 text-light-text/50 select-none">{number}</span>
        <code className="flex-1 text-light whitespace-pre">{children}</code>
    </div>
);

const Keyword = ({ children }: { children?: React.ReactNode }) => <span className="text-purple-400">{children}</span>;
const Func = ({ children }: { children?: React.ReactNode }) => <span className="text-primary">{children}</span>;
const Str = ({ children }: { children?: React.ReactNode }) => <span className="text-orange-400">{children}</span>;
const Comment = ({ children }: { children?: React.ReactNode }) => <span className="text-green-500/80">{children}</span>;

export const IdePreview: React.FC = () => {
    return (
        <section id="ide" className="py-24 px-[5%] bg-dark">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-4">Powerful Online IDE</h2>
                <p className="text-light-text">Experience our feature-rich code editor, powered by the engine of VS Code.</p>
            </div>
            <div className="bg-darker rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-secondary/20">
                <div className="bg-dark p-4 flex justify-between items-center border-b border-secondary/10">
                    <div className="flex gap-2">
                        <div className="bg-secondary text-light text-sm py-2 px-4 rounded-t-lg">Plugin.java</div>
                        <div className="text-light-text text-sm py-2 px-4">config.yml</div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                </div>
                <div className="flex">
                    <div className="w-16 bg-dark flex flex-col items-center py-5 gap-6 border-r border-secondary/10">
                        <Icon name="fileCode" className="w-6 h-6 text-secondary" />
                        <Icon name="search" className="w-6 h-6 text-light-text/70 hover:text-light" />
                        <Icon name="gitBranch" className="w-6 h-6 text-light-text/70 hover:text-light" />
                        <Icon name="bug" className="w-6 h-6 text-light-text/70 hover:text-light" />
                        <Icon name="settings" className="w-6 h-6 text-light-text/70 hover:text-light mt-auto" />
                    </div>
                    <div className="flex-1">
                        <div className="bg-dark p-3 flex justify-between items-center border-b border-secondary/10">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-sm text-light-text hover:text-light cursor-pointer"><Icon name="playCircle" className="w-4 h-4" /> Run</div>
                                <div className="flex items-center gap-2 text-sm text-light-text hover:text-light cursor-pointer"><Icon name="save" className="w-4 h-4" /> Save</div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-light-text">Theme:</span>
                                <div className="w-5 h-5 rounded-full bg-darker border-2 border-light cursor-pointer"></div>
                                <div className="w-5 h-5 rounded-full bg-light cursor-pointer"></div>
                            </div>
                        </div>
                        <div className="p-4 font-mono">
                            <CodeLine number={1}><Keyword>package</Keyword> com.example.myplugin;</CodeLine>
                            <CodeLine number={2} />
                            <CodeLine number={3}><Keyword>import</Keyword> org.bukkit.plugin.java.JavaPlugin;</CodeLine>
                            <CodeLine number={4} />
                            <CodeLine number={5}><Keyword>public class</Keyword> MyPlugin <Keyword>extends</Keyword> JavaPlugin {'{'}</CodeLine>
                            <CodeLine number={6}>    <Keyword>@Override</Keyword></CodeLine>
                            <CodeLine number={7}>    <Keyword>public void</Keyword> <Func>onEnable</Func>() {'{'}</CodeLine>
                            <CodeLine number={8}>        getLogger().info(<Str>"MyPlugin has been enabled!"</Str>);</CodeLine>
                            <CodeLine number={9}>        <Comment>// AI will write your logic here</Comment></CodeLine>
                            <CodeLine number={10}>    {'}'}</CodeLine>
                            <CodeLine number={11} />
                            <CodeLine number={12}>    <Keyword>@Override</Keyword></CodeLine>
                            <CodeLine number={13}>    <Keyword>public void</Keyword> <Func>onDisable</Func>() {'{'}</CodeLine>
                            <CodeLine number={14}>        getLogger().info(<Str>"MyPlugin has been disabled!"</Str>);</CodeLine>
                            <CodeLine number={15}>    {'}'}</CodeLine>
                            <CodeLine number={16}>{'}'}</CodeLine>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
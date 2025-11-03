import React from 'react';

const tutorials = [
    { title: "Your First Plugin", duration: "5 minutes", description: "Go from zero to a working plugin with this quickstart guide.", difficulty: "Beginner" },
    { title: "Advanced Event Handling", duration: "25 minutes", description: "Master the Bukkit event system to create complex interactions.", difficulty: "Intermediate" },
    { title: "Database Integration", duration: "40 minutes", description: "Learn how to connect your plugins to a MySQL database.", difficulty: "Advanced" },
    { title: "Performance Optimization", duration: "30 minutes", description: "Tips and tricks to ensure your plugins run smoothly on any server.", difficulty: "Advanced" },
];

const TutorialCard: React.FC<{ title: string; duration: string; description: string; difficulty: string; }> = ({ title, duration, description, difficulty }) => {
    const difficultyColor = difficulty === 'Beginner' ? 'text-primary' : difficulty === 'Intermediate' ? 'text-yellow-400' : 'text-accent';
    return (
        <div className="bg-dark rounded-2xl p-8 transition-all duration-300 border border-secondary/20 hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 group">
            <div className="flex justify-between items-center mb-4">
                <span className={`text-sm font-bold ${difficultyColor}`}>{difficulty}</span>
                <span className="text-sm text-light-text">{duration}</span>
            </div>
            <h3 className="text-2xl font-poppins font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-light-text mb-6">{description}</p>
            <button className="w-full bg-secondary/30 text-light py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-secondary">Start Learning</button>
        </div>
    );
};


export const Tutorials: React.FC = () => {
    return (
        <section id="tutorials" className="py-24 px-[5%] bg-dark">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-4">Interactive Learning Hub</h2>
                <p className="text-light-text">Level up your skills with our guided tutorials, designed for all experience levels.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {tutorials.map(tut => <TutorialCard key={tut.title} {...tut} />)}
            </div>
        </section>
    );
};
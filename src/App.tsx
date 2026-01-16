import { Stage } from './components/Canvas/Stage';
import { Field } from './components/Canvas/Field';

function App() {
    // Canvas dimensions - using 800x600 for initial testing
    // This will be replaced with dynamic sizing later
    const canvasWidth = 800;
    const canvasHeight = 600;

    const handleCanvasClick = () => {
        console.log('Canvas clicked - will deselect entities');
    };

    return (
        <div className="min-h-screen bg-pitch-green text-tactics-white">
            <header className="p-4 border-b border-tactics-white">
                <h1 className="text-2xl font-heading font-bold">Rugby Animation Tool</h1>
            </header>

            <main className="p-4">
                <div className="border border-tactics-white inline-block">
                    <Stage
                        width={canvasWidth}
                        height={canvasHeight}
                        onCanvasClick={handleCanvasClick}
                    >
                        <Field
                            sport="rugby-union"
                            width={canvasWidth}
                            height={canvasHeight}
                        />
                    </Stage>
                </div>
            </main>
        </div>
    );
}

export default App;

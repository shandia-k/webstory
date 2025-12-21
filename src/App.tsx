import OmniHub from './components/main/OmniHub';
// import { DebugMenu } from './components/debug/DebugMenu'; // Legacy Debug

export default function App() {
    return (
        <div className="relative w-full h-full">
            {/* Main Game UI (Currently Legacy, will be migrated) */}
            <OmniHub />
        </div>
    );
}

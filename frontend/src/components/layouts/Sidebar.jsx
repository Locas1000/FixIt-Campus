export default function Sidebar({ role }) {
    return (
        <div className="p-4">
            <h4>Sidebar</h4>
            <p className="text-muted small">Current Role: {role}</p>
        </div>
    );
}
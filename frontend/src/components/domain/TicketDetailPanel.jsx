export default function TicketDetailPanel({ ticket, onBackToFeed }) {
    return (
        <div className="p-4">
            {/* Mobile back button */}
            <button className="btn btn-outline-secondary btn-sm mb-3 d-md-none" onClick={onBackToFeed}>
                &larr; Back to Feed
            </button>

            <h4>Ticket Detail Panel</h4>
            <p className="text-muted small">Viewing: {ticket?.title}</p>
        </div>
    );
}
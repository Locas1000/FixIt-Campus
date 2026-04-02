export default function TicketFeed({ tickets, onTicketClick, activeTicketId }) {
    return (
        <div className="p-4">
            <h4>Ticket Feed</h4>
            <p className="text-muted small">Loaded {tickets?.length} tickets from dummy data.</p>

            {/* A temporary button so you can test the state change */}
            <button
                className="btn btn-primary btn-sm mt-3"
                onClick={() => onTicketClick(tickets[0])}
            >
                Simulate Clicking First Ticket
            </button>
        </div>
    );
}
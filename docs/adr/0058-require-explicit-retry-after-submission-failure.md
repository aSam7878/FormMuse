# Require explicit retry after submission failure

When the universal Submission Connection rejects, a Form Template will show its designed failure state and preserve entered values only while the form remains mounted. A subsequent attempt must be an Explicit Retry initiated through a visible visitor action. FormMuse will not automatically retry, delay or schedule a resend, queue offline work, register Background Sync, deliver through a service worker, or durably store a failed or pending submission.

The client may observe a timeout or lost response even when the backend accepted the original request. Because FormMuse cannot assume provider idempotency, an automatic resend could duplicate contact messages, newsletter signups, or quote requests. Offline queuing would also violate the Ephemeral Draft boundary by retaining submission data after the visitor's mounted session ends.

Refresh, navigation, tab closure, and unmount discard the values and failure state without warning. Connectivity changes do not trigger submission. Adopters needing idempotency keys, durable queues, offline delivery, or automatic retry own that behavior inside their application and backend rather than receiving it from a visual Template Block.

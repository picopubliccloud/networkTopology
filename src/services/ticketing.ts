// /src/services/ticketing.ts
import apiTicketing from "./api-ticketing";

/* ============================================================
   HEALTH
============================================================ */

export async function ticketingHealth() {
    const { data } = await apiTicketing.get("/health");
    return data;
}

/* ============================================================
   LIST / GET
============================================================ */

export async function listTickets(params?: {
    limit?: number;
    cursor?: string;
    status?: string;
    severity?: string;
}) {
    const { data } = await apiTicketing.get("", { params });
    return data;
}

export async function listPoolTickets(params?: {
    limit?: number;
    cursor?: string;
}) {
    const { data } = await apiTicketing.get("/pool", { params });
    return data;
}

export async function getTicket(ticket_id: string) {
    const { data } = await apiTicketing.get(`/${ticket_id}`);
    return data;
}

/* ============================================================
   CREATE TICKET
============================================================ */

export type TicketType = "INCIDENT" | "REQUEST" | "CHANGE" | "PROBLEM";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Visibility = "PUBLIC" | "INTERNAL";

export type CreateTicketPayload = {
    project_id?: string;
    customer_id: string;
    service_id: string;
    ticket_type: TicketType;
    severity: Severity;
    visibility: Visibility;
    title: string;
    description: string;
    impact_summary?: string;
    suspected_cause?: string;
};

export type CreateTicketResult = {
    ticket_id: string;
    ticket_number?: number;
};

export async function createTicket(
    payload: CreateTicketPayload
): Promise<CreateTicketResult> {
    const res = await apiTicketing.post<CreateTicketResult>("", payload);
    return res.data;
}

/* ============================================================
   UPDATES
============================================================ */
export type AddUpdateRequest = {
    update_type:
    | "COMMENT"
    | "STATUS_CHANGE"
    | "FIELD_CHANGE"
    | "INCIDENT_TIMELINE"
    | "SLA_EVENT"
    | "TAG_EVENT"
    | "LINK_EVENT"
    | "MERGE_EVENT"
    | "SYSTEM_EVENT"
    | "BROADCAST";
    visibility: Visibility;
    body: string;
    structured?: any;
};



export async function addUpdate(ticket_id: string, payload: AddUpdateRequest) {
    const { data } = await apiTicketing.post(`/${ticket_id}/updates`, payload);
    return data;
}

/* ============================================================
   ASSIGN / UNASSIGN
============================================================ */

export type AssignOwnerRequest = {
    user_id: string;
};

export async function assignOwner(ticket_id: string, payload: AssignOwnerRequest) {
    const { data } = await apiTicketing.post(`/${ticket_id}/assign`, payload);
    return data;
}

export type UnassignOwnerRequest = {
    unassign_reason_id: number;
    note?: string;
};

export async function unassignOwner(ticket_id: string, payload: UnassignOwnerRequest) {
    const { data } = await apiTicketing.post(`/${ticket_id}/unassign`, payload);
    return data;
}

/* ============================================================
   LOCK / UNLOCK
============================================================ */

export type LockRequest = {
    lock_reason_id: number;
};

export async function lockTicket(ticket_id: string, payload: LockRequest) {
    const { data } = await apiTicketing.post(`/${ticket_id}/lock`, payload);
    return data;
}

export async function unlockTicket(ticket_id: string) {
    const { data } = await apiTicketing.post(`/${ticket_id}/unlock`);
    return data;
}

/* ============================================================
   CLOSE TICKET
============================================================ */

export type CloseTicketRequest = {
    fix_headline: string;
    symptoms: string;
    root_cause: string;
    fix_applied: string;
    verification_steps: string;
    prevention?: string;
    resolution_code: string;

    // backend will populate bucket/key after upload (when you implement)
    verification_attachment?: {
        bucket: string;
        key: string;
        file_name: string;
        mime_type?: string;
        size_bytes: number;
        sha256_hex?: string;
        is_verification?: boolean;
    };
};

export async function closeTicket(ticket_id: string, payload: CloseTicketRequest) {
    const { data } = await apiTicketing.post(`/${ticket_id}/close`, payload);
    return data;
}

/* ============================================================
   ATTACHMENTS (list + download + upload tempurl + register)
============================================================ */

export type TicketAttachment = {
    attachment_id: string;
    ticket_id: string;
    file_name: string;
    mime_type?: string | null;
    size_bytes?: number | null;
    sha256_hex?: string | null;
    is_verification?: boolean;
    created_at?: string;
};

export type ListAttachmentsResponse = {
    items: TicketAttachment[];
};

export async function listAttachments(ticketId: string): Promise<ListAttachmentsResponse> {
    // ✅ keep consistent with other funcs (base URL already points to /tickets)
    const res = await apiTicketing.get(`/${ticketId}/attachments`);
    return res.data;
}

export type TempUrlResponse = {
    url: string;
    expires_at?: string;
};

export async function getAttachmentTempUrl(
    ticketId: string,
    attachmentId: string
): Promise<TempUrlResponse> {
    const res = await apiTicketing.get(
        `/${ticketId}/attachments/${attachmentId}/temp-url`
    );
    return res.data;
}

/* ============ NEW: upload temp url (Swift TempURL for PUT) ============ */

export type GetUploadTempUrlRequest = {
    file_name: string;
    mime_type?: string;
    size_bytes: number;
    is_verification?: boolean;
};

export type GetUploadTempUrlResponse = {
    upload_url: string; // signed Swift TempURL for PUT
    bucket: string;
    key: string;
    expires_at?: string;
};

export async function getAttachmentUploadTempUrl(
    ticketId: string,
    payload: GetUploadTempUrlRequest
): Promise<GetUploadTempUrlResponse> {
    // backend endpoint you will implement later
    const res = await apiTicketing.post(`/${ticketId}/attachments/upload-temp-url`, payload);
    return res.data;
}

/* ============ NEW: register attachment in DB after upload ============ */

export type RegisterAttachmentRequest = {
    bucket: string;
    key: string;
    file_name: string;
    mime_type?: string;
    size_bytes: number;
    sha256_hex?: string;
    is_verification?: boolean;
    visibility?: "PUBLIC" | "INTERNAL";
};

export type RegisterAttachmentResponse = {
    attachment: TicketAttachment;
};

export async function registerAttachment(
    ticketId: string,
    payload: RegisterAttachmentRequest
): Promise<RegisterAttachmentResponse> {
    // backend endpoint you will implement later
    const res = await apiTicketing.post(`/${ticketId}/attachments`, payload);
    return res.data;
}
export type CustomerOption = { id: string; name: string };

// service option is service_catalog.service_id (UUID) + label
export type ServiceOption = { id: string; label: string };

export async function listCustomers(active = true): Promise<CustomerOption[]> {
    const { data } = await apiTicketing.get(`/meta/customers`, { params: { active } });
    return data.items;
}

export async function listServices(active = true): Promise<ServiceOption[]> {
    const { data } = await apiTicketing.get(`/meta/services`, { params: { active } });
    return data.items;
}


export type MeResponse = { user_id: string };

export async function getMe(): Promise<MeResponse> {
    const res = await apiTicketing.get(`/me`);
    return res.data;
}


export type TicketsSummaryResponse = {
    total: number;
    by_status?: Record<string, number>;
    by_severity?: Record<string, number>;
};

export async function summaryTickets(params?: {
    pool?: boolean;
    status?: string;
    severity?: string;
    include_closed?: boolean;
}): Promise<TicketsSummaryResponse> {
    const { data } = await apiTicketing.get(`/summary`, { params });
    return data;
}

// =============================
// Meta: List assignable users
// =============================
export type UserOption = {
    user_id: string;
    display_name: string | null;
    email: string | null;
    actor_type: string;
};

export type ListUsersParams = {
    q?: string;
    active?: boolean;
    only_ops?: boolean;
    limit?: number;
};

export async function listUsers(params: ListUsersParams = {}): Promise<UserOption[]> {
    const qp = new URLSearchParams();

    if (params.q) qp.set("q", params.q);
    if (params.active !== undefined) qp.set("active", String(params.active));
    if (params.only_ops !== undefined) qp.set("only_ops", String(params.only_ops));
    if (params.limit !== undefined) qp.set("limit", String(params.limit));

    const suffix = qp.toString();
    const res = await apiTicketing.get(`/meta/users${suffix ? `?${suffix}` : ""}`);

    return res.data?.items ?? res.data ?? [];
}
export interface SystemHealth {
    status: "HEALTHY" | "DEGRADED";
    uptime_seconds: number;
    traffic_processed: string;
    automation_rate: string;
    active_threats: number;
    blocked_ips: number;
    severity_dist: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        total: number;
    };
}

export interface Packet {
    id: number;
    timestamp: string;
    src_ip: string;
    country: string;
    lat: number;
    lon: number;
    type: string;
    confidence: number;
    destination_port: number;
    action: "MONITOR" | "AUTO_BLOCKED" | "PENDING_REVIEW" | "MANUAL_BLOCK" | "FALSE_POSITIVE";
    handled_by?: string;
    resolved_at?: string;
}

export type Incident = Packet;

export interface AuditLog {
    id: string;
    type: string;
    action: string;
    timestamp: string;
    src_ip: string;
    country: string;
    confidence: number;
    handled_by?: string;
}

export interface ThreatMapData {
    id: number;
    lat: number;
    lon: number;
    type: string;
    src_ip: string;
    country: string;
}

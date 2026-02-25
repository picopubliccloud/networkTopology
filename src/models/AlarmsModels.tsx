// export interface DownDevice {
//   alarm_id: string;
//   alarm_status: string;
//   severity: string;
//   site: string;
//   name: string;
//   ip: string;
//   down_since: string;
//   comments: string;
// }

// export interface LinkDown {
//   id: number;
//   alarm_id: string;
//   alarm_name: string;
//   hostname: string;
//   ipaddress: string;
//   interface: string;
//   link_type: string;
//   description: string;
//   link_status: string;
//   alarm_status: string;
//   severity: string;
//   create_date: string;
//   clear_date: string | null;
//   acknowledge_date: string | null;
//   last_sync_date: string | null;
//   comments: string;
//   acknowledge_by: string;
//   clear_by: string;
//   duration: number | null;
//   flap_count: number;
//   site: string;
// }

// export interface PSUHealth {
//   site: string;
//   total: number;
//   redundant: number;
//   failed: number;
//   failed_ips: string[];
// }

// export interface SiteSummary {
//   site: string;
//   total: number;
//   totalactive: number;
//   up: number;
//   down: number;

//   downDevices: DownDevice[];
//   downLinks: LinkDown[]; // <-- NEW

//   total_ips: string[];
//   total_active_ips: string[];
//   up_ips: string[];
//   down_ips: string[];
// }

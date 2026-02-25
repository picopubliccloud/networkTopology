import { z } from "zod";

// Zod:
export const InventorySchema = z.object({
  id: z.number().int().positive(),
  asset_type: z.string().nonempty({ message: "Asset type can not be empty." }),
  asset_tag: z.string().nonempty({ message: "Asset tag can not be empty." }),
  brand_model: z.string().nullable().default(null),
  nic_line_card: z.string().nullable().default(null),
  psu: z.string().nullable().default(null),
  site: z.string().nullable(),
  rack: z.string().nullable().default(null),
  unit: z.string().nullable().default(null),
  owner: z.string().nullable().default(null),
  status: z.string().nullable(),
  remark: z.string().nullable().default(null),
  mgmt_ip_address: z.string().nullable().default(null), // inet → string (IP address)
  secondary_ip: z.string().nullable().default(null), // inet → string
  host_name: z.string().nullable().default(null),
  os: z.string().nullable().default(null),
  os_version: z.string().nullable().default(null),
  added_date: z.string().nullable().default(null), // date, time, zone
  added_by: z.string().nullable().default(null),
  last_modified_date: z.string().nullable().default(null),
  last_modified_by: z.string().nullable().default(null),
  removed_date: z.string().nullable().default(null),
  removed_by: z.string().nullable().default(null),
  is_active: z.string().nullable(),
  purpose: z.string().nullable().default(null),
  verification: z.string().nullable().default(null),
  up_down_status: z.string().nullable(),
  last_down_time: z.string().nullable().default(null),
  last_up_time: z.string().nullable().default(null),
  last_down_check_time: z.string().nullable().default(null),
  total_power_supply_count: z.string().nullable().default(null),
  up_power_supply_count: z.string().nullable().default(null),
  down_power_supply_count: z.string().nullable().default(null),
  last_power_supply_check_time: z.string().nullable().default(null),
});

export type InventoryModel = z.infer<typeof InventorySchema>;

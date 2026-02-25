import { jwtDecode } from "jwt-decode";

type KCClaims = {
    sub?: string;
    realm_access?: { roles?: string[] };
    resource_access?: Record<string, { roles?: string[] }>;
};

export function getSub(token: string): string {
    const c = jwtDecode<KCClaims>(token);
    return c.sub ?? "";
}

export function getAllRoles(token: string): string[] {
    const c = jwtDecode<KCClaims>(token);
    const roles: string[] = [];

    if (c.realm_access?.roles) roles.push(...c.realm_access.roles);

    if (c.resource_access) {
        for (const v of Object.values(c.resource_access)) {
            if (v?.roles) roles.push(...v.roles);
        }
    }

    return Array.from(new Set(roles.map(r => r.trim()).filter(Boolean)));
}

export function inferActorType(roles: string[]): "OPS" | "CUSTOMER" {
    // Adjust mapping to your realm/client role naming
    const lower = roles.map(r => r.toLowerCase());
    const isOps = lower.includes("ops") || lower.some(r => r.startsWith("ops_"));
    return isOps ? "OPS" : "CUSTOMER";
}



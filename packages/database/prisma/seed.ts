import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_ROLES = [
  {
    name: 'owner',
    description:
      'Platform owner with full system access across organization settings and tenant controls',
    isSystem: true,
  },
  {
    name: 'admin',
    description:
      'Tenant administrator managing staff, workflows, integrations, and operational policies',
    isSystem: true,
  },
  {
    name: 'case_manager',
    description:
      'Case manager assigned to review, advance, and manage visa applications and applicant tasks',
    isSystem: true,
  },
  {
    name: 'verifier',
    description:
      'Document verifier responsible for inspecting, approving, or rejecting submitted client documents',
    isSystem: true,
  },
  {
    name: 'finance',
    description:
      'Finance specialist handling invoice generation, payment reconciliations, and refunds',
    isSystem: true,
  },
  {
    name: 'client',
    description:
      'Visa applicant or sponsoring client accessing client portal to view case and upload documents',
    isSystem: true,
  },
  {
    name: 'partner',
    description: 'External processing partner or embassy liaison with scoped case access',
    isSystem: true,
  },
];

const PERMISSIONS = [
  // Case permissions
  { action: 'read', subject: 'case', description: 'View cases within tenant scope' },
  { action: 'write', subject: 'case', description: 'Create and update cases within tenant scope' },
  { action: 'delete', subject: 'case', description: 'Delete or archive cases within tenant scope' },
  // Document permissions
  { action: 'upload', subject: 'document', description: 'Upload case documents and attachments' },
  {
    action: 'verify',
    subject: 'document',
    description: 'Verify, approve, or reject uploaded documents',
  },
  {
    action: 'download',
    subject: 'document',
    description: 'Generate signed download URLs for documents',
  },
  // Task permissions
  { action: 'create', subject: 'task', description: 'Create and assign workflow tasks' },
  {
    action: 'execute',
    subject: 'task',
    description: 'Update task progress and mark tasks complete',
  },
  // Finance permissions
  {
    action: 'manage',
    subject: 'finance',
    description: 'Create invoices, process payments, and review transactions',
  },
  // Audit permissions
  { action: 'view', subject: 'audit', description: 'View tenant audit log history' },
  // Agent & Automation permissions
  {
    action: 'run',
    subject: 'agent',
    description: 'Trigger specialist agent runs and workflow executions',
  },
];

const ROLE_PERMISSIONS_MAPPING: Record<string, { action: string; subject: string }[]> = {
  owner: PERMISSIONS.map((p) => ({ action: p.action, subject: p.subject })),
  admin: PERMISSIONS.map((p) => ({ action: p.action, subject: p.subject })),
  case_manager: [
    { action: 'read', subject: 'case' },
    { action: 'write', subject: 'case' },
    { action: 'upload', subject: 'document' },
    { action: 'verify', subject: 'document' },
    { action: 'download', subject: 'document' },
    { action: 'create', subject: 'task' },
    { action: 'execute', subject: 'task' },
    { action: 'run', subject: 'agent' },
  ],
  verifier: [
    { action: 'read', subject: 'case' },
    { action: 'upload', subject: 'document' },
    { action: 'verify', subject: 'document' },
    { action: 'download', subject: 'document' },
    { action: 'execute', subject: 'task' },
  ],
  finance: [
    { action: 'read', subject: 'case' },
    { action: 'download', subject: 'document' },
    { action: 'manage', subject: 'finance' },
  ],
  client: [
    { action: 'read', subject: 'case' },
    { action: 'upload', subject: 'document' },
    { action: 'download', subject: 'document' },
    { action: 'execute', subject: 'task' },
  ],
  partner: [
    { action: 'read', subject: 'case' },
    { action: 'download', subject: 'document' },
    { action: 'execute', subject: 'task' },
  ],
};

export async function seedDatabase() {
  console.info('Seeding baseline database roles and permissions...');

  // 1. Seed Roles
  const roleMap = new Map<string, string>();
  for (const roleDef of SYSTEM_ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description, isSystem: roleDef.isSystem },
      create: roleDef,
    });
    roleMap.set(role.name, role.id);
  }
  console.info(`✓ Seeded ${roleMap.size} system roles.`);

  // 2. Seed Permissions
  const permissionMap = new Map<string, string>();
  for (const permDef of PERMISSIONS) {
    const key = `${permDef.action}:${permDef.subject}`;
    const permission = await prisma.permission.upsert({
      where: {
        action_subject: {
          action: permDef.action,
          subject: permDef.subject,
        },
      },
      update: { description: permDef.description },
      create: permDef,
    });
    permissionMap.set(key, permission.id);
  }
  console.info(`✓ Seeded ${permissionMap.size} granular permissions.`);

  // 3. Link Role Permissions
  let linkedCount = 0;
  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS_MAPPING)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) continue;

    for (const p of perms) {
      const permKey = `${p.action}:${p.subject}`;
      const permissionId = permissionMap.get(permKey);
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
      linkedCount++;
    }
  }
  console.info(`✓ Linked ${linkedCount} role-permission mappings.`);

  // 4. Seed Default Staging / Development Tenant
  const devTenant = await prisma.tenant.upsert({
    where: { slug: 'visahobe-hq' },
    update: { name: 'VisaHobe Headquarters', status: 'active' },
    create: {
      name: 'VisaHobe Headquarters',
      slug: 'visahobe-hq',
      status: 'active',
    },
  });
  console.info(`✓ Seeded development tenant: ${devTenant.name} (${devTenant.id})`);

  // 5. Seed Initial Platform Owner User
  const ownerUser = await prisma.user.upsert({
    where: { email: 'admin@visahobe.com' },
    update: {
      fullName: 'VisaHobe Platform Admin',
      status: 'active',
      mfaEnabled: true,
    },
    create: {
      email: 'admin@visahobe.com',
      fullName: 'VisaHobe Platform Admin',
      phone: '+8801700000000',
      status: 'active',
      mfaEnabled: true,
    },
  });
  console.info(`✓ Seeded platform owner: ${ownerUser.email} (${ownerUser.id})`);

  // 6. Link Owner Membership to HQ Tenant
  const ownerRoleId = roleMap.get('owner');
  if (ownerRoleId) {
    await prisma.membership.upsert({
      where: {
        tenantId_userId: {
          tenantId: devTenant.id,
          userId: ownerUser.id,
        },
      },
      update: { roleId: ownerRoleId, status: 'active' },
      create: {
        tenantId: devTenant.id,
        userId: ownerUser.id,
        roleId: ownerRoleId,
        status: 'active',
      },
    });
    console.info(`✓ Assigned owner role membership in ${devTenant.slug}.`);
  }

  console.info('Database baseline seed completed successfully.');
}

// Run when executed directly
if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .catch((e) => {
      console.error('Error during database seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

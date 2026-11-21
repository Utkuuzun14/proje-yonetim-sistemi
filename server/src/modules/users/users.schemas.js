'use strict';
const { z } = require('zod');
const { registerSchema } = require('../auth/auth.schemas');

const ROLES = ['Yönetici', 'Ekip Üyesi'];
const role = z.enum(ROLES, { error: 'Rol "Yönetici" veya "Ekip Üyesi" olmalıdır.' });

// Yöneticinin kullanıcı eklemesi: kayıt kurallarının aynısı + rol (varsayılan Ekip Üyesi)
const createUserSchema = registerSchema.extend({ role: role.default('Ekip Üyesi') });

const updateRoleSchema = z.object({ role });

module.exports = { createUserSchema, updateRoleSchema, ROLES };

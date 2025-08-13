export const URLS = {
  DEV_BASE_URL: 'https://ui.am.drax.dev',
  PAGES: {
    DASHBOARD: '/dashboard',
    CLIENT_MANAGEMENT: '/clients',
    ENTITY_MANAGEMENT: '/entities'
  }
} as const;

import { decryptPassword } from './encryption';

export const CREDENTIALS = {
  OPERATOR: {
    email: 'qa-op@hydrax.io',
    // Encrypted password - use decryptPassword() to get plain text
    encryptedPassword: '23UhnRdMcwuzI/sLH2rAOkolHrAClrUnB6VBP8/394u1xMjvXXCcrOhw+LM=',
    // Helper method to get decrypted password
    getPassword: () => decryptPassword('23UhnRdMcwuzI/sLH2rAOkolHrAClrUnB6VBP8/394u1xMjvXXCcrOhw+LM=')
  }
} as const;

export const TEST_DATA = {
  CLIENT_PREFIX: 'Testing-PW-Clients',
  ENTITY_PREFIX: 'Testing-PW-Entity',
  CLIENT_TYPE: 'Intermediary',
  ENTITY_TYPE: 'Corporate',
  ENTITY_REMARKS: 'MCP testing'
} as const;

export const SELECTORS = {
  LOGIN: {
    EMAIL_INPUT: 'input[name="username"], textbox[placeholder*="Email" i], input[type="email"]',
    PASSWORD_INPUT: 'input[name="password"], textbox[placeholder*="Password" i], input[type="password"]',
    LOGIN_BUTTON: 'input[type="submit"], button:has-text("Sign In"), button[type="submit"]'
  },
  SIDEBAR: {
    MENU_TOGGLE: 'img[alt="menu-unfold"], img[alt="menu-fold"], .menu-toggle',
    CLIENTS_TAB: 'a:has-text("Account Management"), menuitem:has-text("Account Management")',
    ACCOUNT_MANAGEMENT: 'a:has-text("Account Management"), menuitem:has-text("Account Management")',
    ENTITIES_TAB: 'tab:has-text("Entities"), .entities-tab'
  },
  CLIENT: {
    CREATE_BUTTON: 'button:has-text("Add new"), .create-client-btn',
    NAME_INPUT: 'input[placeholder*="client name" i], textbox[placeholder*="client name" i]',
    TYPE_DROPDOWN: '.ant-select:has-text("Client Type"), select[name="type"]',
    SAVE_BUTTON: 'button:has-text("Submit"), button[type="submit"]',
    TABLE: 'table',
    TABLE_ROWS: 'tr'
  },
  ENTITY: {
    CREATE_BUTTON: 'button:has-text("Add new"), .create-entity-btn',
    NAME_INPUT: 'input[placeholder*="entity name" i], textbox[placeholder*="entity name" i]',
    CLIENT_DROPDOWN: '.ant-select:has-text("Client ID"), select[name="client"]',
    TYPE_DROPDOWN: '.ant-select:has-text("Entity Type"), select[name="type"]',
    REMARKS_INPUT: 'input[placeholder*="remarks" i], textbox[placeholder*="remarks" i]',
    SAVE_BUTTON: 'button:has-text("Submit"), button[type="submit"]',
    TABLE: 'table',
    TABLE_ROWS: 'tr',
    STATUS_COLUMN: 'cell:has-text("Under Review"), cell:has-text("Active")'
  },
  TABS: {
    CLIENTS_TAB: 'tab:has-text("Clients")',
    ENTITIES_TAB: 'tab:has-text("Entities")'
  }
} as const;

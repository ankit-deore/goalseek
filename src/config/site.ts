/**
 * Central place for product text and labels.
 * Change wording here instead of hunting through components.
 */
export const site = {
  name: "GoalSeek",
  tagline: "Make job seeking stress free.",
  description:
    "Save job, certification, project and meetup links in one shared inbox, track what you did with them, and get a daily reminder before deadlines slip.",
  themeColor: "#4f46e5",
  backgroundColor: "#f8fafc",
} as const;

export const nav = [
  { href: "/inbox", label: "Inbox" },
  { href: "/tracker", label: "Tracker" },
  { href: "/settings", label: "Settings" },
] as const;

export const copy = {
  landing: {
    heading: "Stop losing great links in group chats.",
    sub: "GoalSeek turns every job, course and meetup link your friends share into a tracked to-do, with reminders before deadlines.",
    cta: "Continue with Google",
    points: [
      "Paste a link and GoalSeek fills in the title and guesses what it is.",
      "Share an inbox with friends so nobody duplicates work.",
      "Track status, the JD and which resume you sent.",
      "Get one email a day with deadlines and links you haven't touched.",
    ],
  },
  login: {
    heading: "Sign in to GoalSeek",
    sub: "Use your Google account. We only read your name, email and photo.",
    button: "Continue with Google",
    error: "Sign in didn't work. Please try again.",
  },
  inbox: {
    heading: "Inbox",
    sub: "New links waiting for a decision.",
    empty: "Your inbox is clear. Paste a link above to add one.",
    addPlaceholder: "Paste a link (job, course, project, meetup…)",
    addButton: "Add",
    adding: "Adding…",
    duplicate: "That link is already in this workspace.",
    invalidUrl: "That doesn't look like a web link.",
  },
  tracker: {
    heading: "Tracker",
    sub: "Everything you've acted on, grouped by status.",
    empty: "Nothing here yet. Move a link out of New to start tracking it.",
  },
  item: {
    back: "Back",
    save: "Save changes",
    saving: "Saving…",
    saved: "Saved",
    delete: "Delete link",
    deleteConfirm: "Delete this link for everyone in the workspace?",
    open: "Open link",
    fields: {
      title: "Title",
      category: "Category",
      status: "Status",
      owner: "Owner",
      deadline: "Deadline",
      resumeVersion: "Resume version used",
      jdText: "Job description (paste it here so you have it after the post is taken down)",
      notes: "Notes",
    },
    unassigned: "Nobody yet",
    addedBy: "Added by",
  },
  filters: {
    all: "All",
    mine: "Assigned to me",
    category: "Category",
    owner: "Owner",
  },
  settings: {
    heading: "Settings",
    reminders: {
      heading: "Daily reminder email",
      sub: "One email a day with deadlines coming up and links nobody has touched.",
      enabled: "Send me the daily email",
      time: "Send at",
      timezone: "Time zone",
      save: "Save reminder settings",
      saved: "Reminder settings saved",
    },
    workspaces: {
      heading: "Workspaces",
      sub: "A workspace is a shared inbox. Invite friends to see and update the same links.",
      current: "Current",
      switch: "Switch",
      createPlaceholder: "New workspace name",
      create: "Create workspace",
      members: "Members",
      invite: "Create invite link",
      inviteHelp: "Send this link to a friend. It works for 7 days.",
      leave: "Leave",
    },
    apiKeys: {
      heading: "Personal API keys",
      sub: "Used by the browser extension, Android share and iPhone Shortcut to save links for you. Treat a key like a password.",
      namePlaceholder: "Key name, e.g. Chrome on laptop",
      create: "Create key",
      copyNow: "Copy this key now. You won't be able to see it again.",
      revoke: "Revoke",
      lastUsed: "Last used",
      never: "never",
      endpoint: "Capture endpoint",
    },
  },
  join: {
    heading: "Join workspace",
    invalid: "This invite link is invalid or has expired. Ask for a new one.",
    accept: "Join",
  },
  share: {
    heading: "Saving link…",
    noUrl: "No link was shared.",
  },
  common: {
    signOut: "Sign out",
    signedInAs: "Signed in as",
    loading: "Loading…",
    error: "Something went wrong. Please try again.",
  },
} as const;

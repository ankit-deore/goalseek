/**
 * Categories, statuses and the rules used to guess a link's category.
 * Values match the Postgres enums in supabase/migrations/0001_init.sql.
 */

export const CATEGORIES = ["job", "certification", "project", "meetup", "resource"] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["new", "interested", "applied", "interview", "rejected", "skipped"] as const;
export type Status = (typeof STATUSES)[number];

export const categoryLabels: Record<Category, string> = {
  job: "Job",
  certification: "Certification",
  project: "Project",
  meetup: "Meetup",
  resource: "Resource",
};

export const statusLabels: Record<Status, string> = {
  new: "New",
  interested: "Interested",
  applied: "Applied",
  interview: "Interview",
  rejected: "Rejected",
  skipped: "Skipped",
};

/** Statuses shown as columns on the tracker page, in order. */
export const trackerStatuses: Status[] = ["interested", "applied", "interview", "rejected", "skipped"];

/** Statuses where a link is finished and no longer needs reminders. */
export const closedStatuses: Status[] = ["rejected", "skipped"];

/**
 * Rules for guessing a category from a URL. The first matching rule wins.
 * `hosts` match the end of the hostname (so "lever.co" matches "jobs.lever.co").
 * `paths` match anywhere in the path or query, case-insensitive.
 */
export const categoryRules: { category: Category; hosts: string[]; paths: string[] }[] = [
  {
    category: "meetup",
    hosts: ["meetup.com", "lu.ma", "luma.com", "eventbrite.com", "eventbrite.co.uk", "konfhub.com", "allevents.in", "hasgeek.com", "gdg.community.dev", "commudle.com"],
    paths: ["/events/", "/event/", "meetup", "webinar", "hackathon"],
  },
  {
    category: "certification",
    hosts: ["coursera.org", "udemy.com", "edx.org", "udacity.com", "credly.com", "learn.microsoft.com", "skillshop.withgoogle.com", "cloudskillsboost.google", "aws.amazon.com/certification", "nptel.ac.in", "swayam.gov.in", "simplilearn.com", "greatlearning.in", "linkedin.com/learning"],
    paths: ["/certification", "/certificate", "/course", "/learn/", "/specializations/", "/professional-certificates/"],
  },
  {
    category: "job",
    hosts: ["lever.co", "greenhouse.io", "workday.com", "myworkdayjobs.com", "smartrecruiters.com", "ashbyhq.com", "naukri.com", "indeed.com", "indeed.co.in", "instahyre.com", "wellfound.com", "angel.co", "foundit.in", "hirist.tech", "cutshort.io", "iimjobs.com", "glassdoor.com", "glassdoor.co.in", "workable.com", "breezy.hr", "recruitee.com", "jobvite.com", "icims.com", "taleo.net", "successfactors.com"],
    paths: ["/jobs/", "/job/", "/careers/", "/career/", "/openings", "/vacancies", "/positions/", "jobid", "job_id", "/apply", "currentjobid"],
  },
  {
    category: "project",
    hosts: ["github.com", "gitlab.com", "kaggle.com", "devpost.com", "huggingface.co", "replit.com", "codesandbox.io", "unstop.com"],
    paths: ["/competitions/", "/challenge", "/project"],
  },
];

/** Reminder email rules. */
export const reminderRules = {
  /** Deadlines within this many days are listed as "due soon". */
  deadlineWindowDays: 3,
  /** Links still "New" after this many days without activity count as untouched. */
  untouchedAfterDays: 2,
  /** Cap each section so the email stays short. */
  maxItemsPerSection: 10,
  /** Default send time (hour, 24h) and time zone for new users. */
  defaultHour: 21,
  defaultTimezone: "Asia/Kolkata",
} as const;

/** Link preview fetching. */
export const previewRules = {
  timeoutMs: 6000,
  maxBytes: 1_000_000,
  userAgent: "Mozilla/5.0 (compatible; GoalSeekBot/1.0; +link preview)",
} as const;

/** Field length limits shared by forms and the capture API. */
export const limits = {
  url: 2048,
  title: 300,
  notes: 5000,
  jdText: 50000,
  resumeVersion: 120,
  workspaceName: 80,
  apiKeyName: 60,
} as const;

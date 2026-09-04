import type {
  BlogPost,
  DiscipleshipProgram,
  Event,
  OutreachProject,
  Sermon,
  Testimonial,
} from "@/types";

export const SITE_NAME = "Christian Life Altar Network";
export const SITE_SHORT = "CLAN";
export const SITE_TAGLINE = "The Rebirth of True Christianity";
export const SITE_DESCRIPTION =
  "A community committed to discipleship, prayer, the Word, outreach, and helping people discover and fulfill their purpose in Christ Jesus.";

export const CONTACT = {
  email: "hello@clanministry.org",
  phone: "(+234) 811 926 4733",
  location: "Otukpo Benue State, Nigeria",
};

export const SAMPLE_SERMONS: Sermon[] = [
  {
    id: "s1",
    title: "The Rebirth of True Christianity",
    slug: "the-rebirth-of-true-christianity",
    speaker_id: null,
    speaker: {
      id: "sp1",
      name: "Ministry Leader",
      photo_url: null,
      bio: null,
    },
    date: new Date().toISOString(),
    category: "Discipleship",
    scripture: "John 3:3",
    description:
      "An introduction to CLAN's core message: returning to the authentic life and teachings of Jesus Christ.",
    thumbnail_url: null,
    audio_url: null,
    video_url: null,
    notes_url: null,
    tags: ["rebirth", "discipleship", "christ"],
    featured: true,
    published: true,
  },
  {
    id: "s2",
    title: "Building a Life of Prayer",
    slug: "building-a-life-of-prayer",
    speaker_id: null,
    speaker: {
      id: "sp1",
      name: "Ministry Leader",
      photo_url: null,
      bio: null,
    },
    date: new Date().toISOString(),
    category: "Prayer",
    scripture: "1 Thessalonians 5:17",
    description:
      "Learning to develop a consistent, intentional and faith-filled prayer life.",
    thumbnail_url: null,
    audio_url: null,
    video_url: null,
    notes_url: null,
    tags: ["prayer", "faith"],
    featured: true,
    published: true,
  },
  {
    id: "s3",
    title: "Discovering Your Purpose in Christ",
    slug: "discovering-your-purpose-in-christ",
    speaker_id: null,
    speaker: {
      id: "sp2",
      name: "Guest Speaker",
      photo_url: null,
      bio: null,
    },
    date: new Date().toISOString(),
    category: "Purpose",
    scripture: "Jeremiah 29:11",
    description:
      "Helping believers identify their God-given gifts, calling and purpose in Jesus Christ.",
    thumbnail_url: null,
    audio_url: null,
    video_url: null,
    notes_url: null,
    tags: ["purpose", "calling", "gifts"],
    featured: false,
    published: true,
  },
];

export const SAMPLE_EVENTS: Event[] = [
  {
    id: "e1",
    title: "Community Prayer Meeting",
    slug: "community-prayer-meeting",
    description:
      "Join us as we gather to pray together for our community, our nation, and the work of the Kingdom.",
    date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    time: "18:00",
    location: "Main Gathering Hall",
    is_online: true,
    online_link: null,
    speaker: null,
    image_url: null,
    registration_link: null,
    category: "Prayer Meeting",
    published: true,
  },
  {
    id: "e2",
    title: "Discipleship Class",
    slug: "discipleship-class",
    description:
      "A structured class to help believers grow into mature followers of Jesus Christ.",
    date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    time: "10:00",
    location: "Learning Centre",
    is_online: false,
    online_link: null,
    speaker: null,
    image_url: null,
    registration_link: null,
    category: "Discipleship Class",
    published: true,
  },
  {
    id: "e3",
    title: "Bible Study",
    slug: "bible-study",
    description:
      "An interactive study of God's Word to know, understand and live according to Scripture.",
    date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    time: "17:30",
    location: "Fellowship Hall",
    is_online: true,
    online_link: null,
    speaker: null,
    image_url: null,
    registration_link: null,
    category: "Bible Study",
    published: true,
  },
];

export const SAMPLE_PROGRAMS: DiscipleshipProgram[] = [
  {
    id: "p1",
    title: "Foundations of Faith",
    slug: "foundations-of-faith",
    description:
      "A foundational program for new believers covering the essentials of the Christian faith, discipleship and prayer.",
    duration: "8 Weeks",
    schedule: "Saturdays, 10:00 AM",
    image_url: null,
    featured: true,
    published: true,
  },
  {
    id: "p2",
    title: "School of Prayer",
    slug: "school-of-prayer",
    description:
      "Training in the discipline of prayer — personal, intercessory and corporate.",
    duration: "6 Weeks",
    schedule: "Tuesdays, 6:00 PM",
    image_url: null,
    featured: true,
    published: true,
  },
  {
    id: "p3",
    title: "Purpose Discovery",
    slug: "purpose-discovery",
    description:
      "Identify your spiritual gifts and calling, and learn to walk in your God-given purpose.",
    duration: "4 Weeks",
    schedule: "Sundays, 4:00 PM",
    image_url: null,
    featured: false,
    published: true,
  },
];

export const SAMPLE_OUTREACH: OutreachProject[] = [
  {
    id: "o1",
    title: "Community Feeding Programme",
    slug: "community-feeding-programme",
    description:
      "Serving meals and sharing the love of Christ with families in our local community.",
    location: "Local Community",
    date: new Date().toISOString(),
    image_url: null,
    status: "current",
    published: true,
  },
];

export const SAMPLE_BLOG: BlogPost[] = [
  {
    id: "b1",
    title: "The Power of Consistent Prayer",
    slug: "the-power-of-consistent-prayer",
    author: "Ministry Team",
    featured_image: null,
    content: "<p>Prayer is the lifeblood of the believer...</p>",
    category: "Prayer",
    tags: ["prayer", "devotional"],
    seo_title: null,
    seo_description: null,
    published_date: new Date().toISOString(),
    published: true,
    featured: true,
  },
];

export const SAMPLE_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "A CLAN Member",
    email: null,
    testimony:
      "Through CLAN, I discovered my purpose in Christ and grew in my walk with the Lord. The community has been a true family to me.",
    photo_url: null,
    approved: true,
  },
];

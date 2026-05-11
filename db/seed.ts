import { db } from 'astro:db';

// No seed data — all content is authored through the authoring layer.
export default async function seed() {
  // intentionally empty
  void db; // satisfies the import
}

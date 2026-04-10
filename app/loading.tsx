export default function Loading() {
  // We return null here because the global TopLoader and content transitions 
  // in MainLayout handle the loading feedback much more smoothly 
  // without a disruptive full-screen overlay.
  return null;
}

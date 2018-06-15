import debug from "debug";
export function logger (tag) {
  return {
    debug: debug(`gyaon:${tag}`),
    error: debug(`gyaon:error:${tag}`)
  }
}

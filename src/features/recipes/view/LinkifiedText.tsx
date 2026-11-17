/** Text with its web addresses turned into links */
export function LinkifiedText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(https?:\/\/\S+)/).map((part, index) => {
        if (index % 2 === 0) return part
        // Punctuation at the end of a sentence isn't part of the address
        const [, url, trailing] = /^(.*?)([.,;:!?)]*)$/.exec(part) ?? [part, part, '']
        return (
          <span key={index}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline break-all"
            >
              {url}
            </a>
            {trailing}
          </span>
        )
      })}
    </>
  )
}

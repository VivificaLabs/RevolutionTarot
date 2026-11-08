import { Fragment } from 'react'

export default function Tags({ tags }: { tags?: string[] }) {
  return <>{tags?.map(tag => <Fragment key={tag}> <span className="rl-tag">{tag}</span></Fragment>)}</>
}

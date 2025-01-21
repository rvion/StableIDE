import type { GithubUserName } from './GithubUser'

import { assets } from '../utils/assets/assets'
import { asGithubUserName, GithubUser } from './GithubUser'

export function GithubUserUI(p: {
   //
   username: GithubUserName
   size?: string
   prefix?: string
   showName?: boolean | 'after'
   className?: string
   textClassName?: string
}): React.JSX.Element | GithubUserName {
   const { username } = p
   const size = p.size ?? '1.5rem'

   const textClassName = p.textClassName
   const imgURL =
      username === 'CushyStudio' //
         ? assets.CushyLogo_512_png
         : GithubUser.get(cushy, asGithubUserName(username), false).localAvatarURL
   try {
      return (
         <div className={p.className} tw='flex gap-1'>
            {p.prefix} {p.showName === 'after' && <p className={textClassName}>{username}</p>}
            <img
               style={{ borderRadius: '100%', height: size, width: size }}
               src={imgURL}
               alt={`${username}'s avatar`}
               // width='100'
            />
            {p.showName === true && <p className={textClassName}>{username}</p>}
         </div>
      )
   } catch (error) {
      console.error(error)
      return username
   }
}

// Usage:
// <GithubUser username="octocat" />

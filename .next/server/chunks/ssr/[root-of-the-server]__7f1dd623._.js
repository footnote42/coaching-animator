module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},70864,a=>{a.n(a.i(33290))},43619,a=>{a.n(a.i(79962))},13718,a=>{a.n(a.i(85523))},18198,a=>{a.n(a.i(45518))},62212,a=>{a.n(a.i(66114))},27258,a=>{"use strict";a.s(["GalleryDetailClient",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call GalleryDetailClient() from the server but GalleryDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/gallery/[id]/GalleryDetailClient.tsx <module evaluation>","GalleryDetailClient")},19975,a=>{"use strict";a.s(["GalleryDetailClient",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call GalleryDetailClient() from the server but GalleryDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/gallery/[id]/GalleryDetailClient.tsx","GalleryDetailClient")},2589,a=>{"use strict";a.i(27258);var b=a.i(19975);a.n(b)},91598,a=>{"use strict";var b=a.i(7997);a.i(70396);var c=a.i(73727),d=a.i(98310),e=a.i(2589);async function f({params:a}){let{id:b}=await a,c=await (0,d.createSupabaseServerClient)(),{data:e}=await c.from("saved_animations").select("title, description, animation_type, tags").eq("id",b).is("hidden_at",null).eq("visibility","public").single();if(!e)return{title:"Animation Not Found"};let f=e.description||`A ${e.animation_type} animation for rugby coaching`;return{title:`${e.title} | Coaching Animator Gallery`,description:f,keywords:["rugby","animation","coaching",e.animation_type,...e.tags||[]],openGraph:{title:e.title,description:f,type:"website",images:[`/api/og/${b}`]},twitter:{card:"summary_large_image",title:e.title,description:f,images:[`/api/og/${b}`]}}}async function g({params:a}){let{id:f}=await a,g=await (0,d.createSupabaseServerClient)(),{data:h,error:i}=await g.from("saved_animations").select(`
      id,
      title,
      description,
      coaching_notes,
      animation_type,
      tags,
      payload,
      duration_ms,
      frame_count,
      visibility,
      upvote_count,
      view_count,
      created_at,
      user_id,
      user_profiles!saved_animations_user_id_fkey (
        display_name
      )
    `).eq("id",f).is("hidden_at",null).eq("visibility","public").single();(i||!h)&&(0,c.notFound)(),await g.from("saved_animations").update({view_count:(h.view_count||0)+1}).eq("id",f);let j=h.user_profiles?.display_name||"Anonymous Coach";return(0,b.jsx)(e.GalleryDetailClient,{animation:{...h,author:{display_name:j}}})}a.s(["default",()=>g,"generateMetadata",()=>f])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__7f1dd623._.js.map
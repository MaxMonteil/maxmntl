---
title: 'Empty State Onboarding'
pubDate: 2026-02-02
description: 'My approach to onboarding flows in apps'
---
<section>

  # Empty State Onboarding

  I've been working on my app Mylo for quite some time now. It's a workout app aimed at athletes, or anyone that does "standard" training like in the gym and then does some sport specific training.

  There's a lot of workout apps out there but I never found one that had the flexibility you'd need for some of the crazy sport-specific training I've seen.
<label for="crazy-sports-tangent" class="margin-toggle">&#8853;</label>
<input type="checkbox" id="crazy-sports-tangent" class="margin-toggle"/>
<span class="marginnote">
  Think about wild sports like Slap Fighting. It's got pro leagues and all. They're training for this, but how? I don't know of an app that would support this.
</span>

  Anyways, Mylo has been almost done for quite a long time but lately I've really been blasting through my launch checklist and now I only have the dreaded 10% left.
</section>

<section>

  ## 10% left AKA you forgot about onboarding (1%)

  One part of the 10% is onboarding.

  Getting strangers familiar with something that's become second nature to me now after all my time with it.

  Now onboarding, like most things, has a massive rabbit hole behind it with full on psychology studies. For me and my goals here, onboarding is the act of educating and informing a new person how something works.

  I've seen 4 main ways to onboard a user onto an app. They all have their goals and likely fit better in some experiences better than others, but I had my gripes with most of them.

  ### 1. Welcome Slides

  That's when the app opens up for the first time with a sort of fullscreen slideshow of the features and benefits of the app that you can click or swipe through.

  I find this is often the same slides you see in the app store showcase. It usually says something you already know, you installed the app, you're already convinced.

  I tend to swipe through this as fast as possible or press the skip button.

  ### 2. Guided Clicking Tour

  Here the app takes you along this on-rails experience, highlighting different parts of the app to click on. Like a video game tutorial.

  This can work if it isn't too long or if the app is in fact very complicated, but I think it takes away too much agency from the user.

  I've just landed in a new place, I'd like to explore a bit at my own pace.

  The tour can also lead to information overload, in a few minutes you get sheparded from place to place, semi-thoughtlessly following prompts. Once done it can be tougher to do the same steps again alone, kinda like the feeling of tutorial hell.

  ### 3. Intro Setup Form

  With the intro form, the app opens up with some simple questions to help setup the app for your use case.

  For a workout app for example, this would be the one that asks your experience level, gender, height, blood type, astrological sign, and then does something with it.

  Most egregiously, I've seen this use the sunken cost principle to offer some paid thing once your a few steps too far. Some even have little encouragement messages in between to keep you going.

  This once again takes away agency, it can be useful though if you're filling out info that will rarely need to change and it ends with some actionable result.

  ### 4. Self Explanatory Interface

  Maybe a nice way of saying there's no onboarding. But if the product is extremely well executed, this may be the holy grail.

  I liken it to physical products like a door handle. It doesn't take too much effort to figure it out without a guide.
  <label for="handle-tangent" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="handle-tangent" class="margin-toggle"/>
  <span class="marginnote">
    Even the "simplest" and "most-obvious" item can still confuse someone or be used in unintended ways. Like door handles serving as in-a-pinch dentists for loose teeth.
  </span>

  This is the best version for sure, but near impossible to achieve.
</section>

<section>

  ## Enter: Empty State Onboarding

  The above methods need careful execution and a good app likely needs some combination.

  In my hubris though, I wanted none of that.

  I wanted onboarding that doesn't get in your way, onboarding that is present only when you'd need it. It should be dismissable yet still accessible afterwards.

  To make it cool I gave it a name: **Empty State Onboarding**
  <label for="name-tangent" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="name-tangent" class="margin-toggle"/>
  <span class="marginnote">
    This probably already exists with a different name. <a href="https://xkcd.com/927/">Now we have 15 standards.</a>
  </span>

  In a nutshell, this onboarding works kind of like placeholders.

  In a place or situation where some action is expected of the user, relevant help information is presented about exactly the next step to take, right where you need to take it.

  In a multi-step flow, each part would entice the next step, which then reveals the next bit of helpful information.

  ### Dynamic Empty State Onboarding ~the Reckoning~

  One step further is persistent Empty State Onboarding on screens that would get filled up from multiple steps that need to be accomplished elsewhere.

  In the case of Mylo, the main page is your training schedule, which starts off empty when you don't have any workouts.

  Onboarding there asks you to create a workout as step 1 with a button to directly go do that.

  Step 2 below is visible but grayed out.

  Once step 1 is complete, if you come back here, step 2 is now clearer and shows a helpful list of the workout(s) you just made and you can directly add them to your schedule from there.

  For a new user, this shortcuts the action until you get more familiar with the app. Later on, once the new environment is more familiar, you'll be more comfortable checking out more things.
</section>

<section>

  ## Education and Dismissal

  The last step is education.

  These onboarding bits of info can be dismissed, but they re-appear the next time.

  Dismiss it once more and the next time you see it, you can permanently make it go away.

  That means you see it 3 times at least helping you remember the information (or you can dismiss it right away).

  But what if you dismissed it in a hurry, or some time later you have questions?

  For this, I felt an important part of good onboarding is making this information always available later. So in the settings page you can see a "Help & Guides" section where that same onboarding information is present.
</section>

<section>

  ## Conclusion

  So this was my approach to onboarding. <label for="images-tangent" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="images-tangent" class="margin-toggle"/>
  <span class="marginnote">
    I really need to add some images to my blog, would have made this post much easier to understand...
    Thank you for getting this far dear reader!
  </span>

  I'll have to see how people actually respond to it, it might fail and I fallback to a more classic approach.

  But! It might work wonders and help new users find their way around a new app without feeling a loss of control or curiosity.

  Empty state onboarding also better matches my values for Mylo. It's there to help you and support you but without getting in your way or forcing an approach on you.
</section>

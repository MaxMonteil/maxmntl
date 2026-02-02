---
layout: ../../layouts/PostLayout.astro
title: 'Account Optional Apps with PowerSync'
pubDate: 2026-02-05
description: 'Using PowerSync to make an app you can use without requiring an account.'
---
<section>

  # Account Optional Apps with PowerSync

  <p class="subtitle">Local-first is cool. PowerSync is local-first. Therefore, PowerSync is cool. CQFD.</p>

  Now lets look at the proof.

  First, we need some definitions.

  ## Local-first

  Local-first software is a growing movement and pattern in software development aiming to bring back the Good Old Days when you downloaded an app, it was fast, and it worked without internet and your data was all yours to do with what you want.

  It's a more modern take on that with some modern ammenities for the way we work now where internet is at least expected so that you can access your data on multiple devices, work with other people and more.

  The best place to start learning more is with the [Seven Ideals for local-first software](https://www.inkandswitch.com/essay/local-first/#seven-ideals-for-local-first-software:~:text=collaboration%20and%20ownership-,Seven%20ideals%20for%20local%2Dfirst%20software,-1.%20No%20spinners) by the Ink and Switch lab who coined the term and played a principal role in its spread.

  ### More about local-first

  - [Ink and Switch - Local-first Essay](https://www.inkandswitch.com/essay/local-first)
  - [lofi.so](https://lofi.so/)
  - [Local-first Landscape](https://www.localfirst.fm/landscape)

  ## PowerSync

  A large part of what makes modern local-first software lies in the sync-engine.

  Cause in order to have an experience that works offline, you need all your data accessible on your device locally. But to then access it on other devices or work collaboratively with others, some version of it needs to be on someone else's server.

  This version needs to stay up to date with your local changes, some kind of code, machine, or *engine* needs to be in charge of doing the sync.

  You can write your own which Linear did or you can use something like [PowerSync](https://www.PowerSync.com/).

  PowerSync will let you have a SQLite database in your user's browser against which you can manage all their created data while in the background it'll handle syncing your changes to a remote Postgres database (, MongoDB, MySQL, or SQL Server).

  It also works for pretty much any web or native client framework as well.
</section>

<section>

  ## Local-first means you shouldn't require an account

  What's not to love about local-first,
<label for="local-first-shots" class="margin-toggle">&#8853;</label>
<input type="checkbox" id="local-first-shots" class="margin-toggle"/>
<span class="marginnote">
  Damn, take a shot everytime you read "local-first".
</span> apps will load and behave instantly, you don't need to be constantly connected, your data is all yours without having to fight a corporate (purposefully?) obtuse export system, and even if the original service dies, you can keep chugging along.

  All while keeping modern benefits like sync and collaboration.

  I wanted that and more for my app so when I took local-first further, I realized I don't even need to require users to make an account.

  After downloading the app, all your data is there, if you don't need or want to sync then there's no point in having an account. That shoudn't limit you otherwise it goes against ideal 7: "You retain ultimate ownership and control".
<label for="free-users" class="margin-toggle">&#8853;</label>
<input type="checkbox" id="free-users" class="margin-toggle"/>
<span class="marginnote">
  Another benefit of not requiring an account is that it's then cheaper to run the app. You can have a majority of users able to use your app without it costing you in auth seats if you use a paid service, or in DB space since sync is off.
</span>

  That should still apply after making an account of course, but why not without too?

  So with these values in mind, I set out to update my app such that you can use the full suite of features without an account. Then when you want sync or some account-requiring feature you can choose to make one while keeping all your data.
</section>

<section>

  ## The setup

  Tech here will be PowerSync of course, and Vue.

  A critical resource was PowerSync's own [React Supabase Todolist with Optional Sync](https://github.com/PowerSync-ja/PowerSync-js/tree/main/demos/react-supabase-todolist-optional-sync) example which set the foundation I worked off of. I recommend going over the README.md there for an explanation of how it works.

  Additionally I'll go over issues and other things I ran into.

  ### Rough Steps

  1. [Change your PowerSync schema creation into a function with dynamic names](#function-able-schema)
  2. [Keep track when Sync Mode is enabled or not](#sync-mode-tracking)
  3. [Update your routes and UX around the auth and "user setting" pages](#auth-routes-and-pages)
  4. [Handle the "signed out user"](#default-signed-out-user)
  5. [Add a reference to the User ID in all columns if not present](#user-id-references-in-tables)
  6. The rest of the owl
      * [Implement Schema change and data transfer](#local-to-sync-data-transfer)
      * [Switching tables and data on auth](#switching-sync-mode-on-auth)
      * [Handling Foreign Key references during the batch insert](#insert-order-of-operations)

  Once again, we'll be referring to [PowerSync's own example on how to do this](https://github.com/PowerSync-ja/PowerSync-js/tree/main/demos/react-supabase-todolist-optional-sync) quite a lot.

  We've got our plan, lets get to it!
</section>

<section>

  ## Function-able Schema

  We start of simple by just making sure our schema is built with a function that can take one argument.

  By default, PowerSync recommends defining your tables at the top-level then passing them into `new Schema` like so:

  ```ts
  const todos = new Table(
    { /* table columns */ },
    { /* table options */ },
  )

  const lists = new Table({ /* list of columns */ });

  export const AppSchema = new Schema({
    todos,
    lists,
  })
  ```

  But we'll need to create our schema with dynamic view names, depending on whether we're in sync mode or not.

  First we create an object for our table definitions.
  <label for="option-function" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="option-function" class="margin-toggle"/>
  <span class="marginnote">
    ⚠ Watch out! `options` is a function.
  </span>

  ```ts
  const todosDef = {
    columns: { /* table columns */ },
    options: (viewName: string, localOnly = false) => ({
      viewName,
      localOnly,
      /* other table options */
    }),
  }
  ```

  `columns` hasn't changed.

  `options` is now a function, this was to avoid having to pass the same table options key value pairs so often.


  This here comes straight from the example. These functions set the correct table view names depending on the sync mode we're in.
  We can set whatever view name we want, but know that this will be the way to refernce these tables in all your queries.

  ```ts
  function syncedName(table: string, synced: boolean) {
    return synced ? table : `inactive_synced_${table}`
  }

  function localName(table: string, synced: boolean) {
    return synced ? `inactive_local_${table}` : table
  }
  ```
  Finally there's the actual schema creation:
  <label for="curry-function" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="curry-function" class="margin-toggle"/>
  <span class="marginnote">
    `toSyncedName` & `toLocalName` are other examples of lazyness. I didn't want to type the same thing out too much.
    <br><br>
    I also set the default argument value here to `true` since we haven't set up anything else yet. This way everything should still continue to work.
  </span>

  ```ts
  export function makeSchema(synced = true) {
    const toSyncedName = (table: string) => syncedName(table, synced)
    const toLocalName = (table: string) => localName(table, synced)

    return new Schema({
      lists: new Table(
        listsDef.columns,
        listsDef.options(toSyncedName('lists')),
      ),
      local_lists: new Table(
        listsDef.columns,
        listsDef.options(toLocalName('lists'), true),
      ),

      todos: new Table(
        todosDef.columns,
        todosDef.options(toSyncedName('todos')),
      ),
      local_todos: new Table(
        todosDef.columns,
        todosDef.options(toLocalName('todos'), true),
      ),

      /* Local only draft tables */
      draft_todos: new Table(
        todosDef.columns,
        todosDef.options('draft_todos', true),
      ),
    })
  }
  ```

  Of special note here is the `draft_todos` table. This is a table that will always be local only, I don't want to sync it and in my app the logic already always clears it out.
  <label for="draft-tables" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="draft-tables" class="margin-toggle"/>
  <span class="marginnote">
    I used these tables for long running forms. Copy the live data into a draft table, apply user edits to it, then on save reconcile the changes. With this pattern I had an easier time dropping all changes on quit or cancel.
  </span>


  <details>
    <summary><h3>Here's the full thing all together</h3></summary>

  ```ts
  const listsDef = {
    columns: { /* table columns */ },
    options: (viewName: string, localOnly = false) => ({
      viewName,
      localOnly,
    }),
  }

  const todosDef = {
    columns: { /* table columns */ },
    options: (viewName: string, localOnly = false) => ({
      viewName,
      localOnly,
      /* other table options */
    }),
  }

  function syncedName(table: string, synced: boolean) {
    return synced ? table : `inactive_synced_${table}`
  }

  function localName(table: string, synced: boolean) {
    return synced ? `inactive_local_${table}` : table
  }

  export function makeSchema(synced = true) {
    const toSyncedName = (table: string) => syncedName(table, synced)
    const toLocalName = (table: string) => localName(table, synced)

    return new Schema({
      lists: new Table(
        listsDef.columns,
        listsDef.options(toSyncedName('lists')),
      ),
      local_lists: new Table(
        listsDef.columns,
        listsDef.options(toLocalName('lists'), true),
      ),

      todos: new Table(
        todosDef.columns,
        todosDef.options(toSyncedName('todos')),
      ),
      local_todos: new Table(
        todosDef.columns,
        todosDef.options(toLocalName('todos'), true),
      ),

      /* Local only draft tables */
      draft_todos: new Table(
        todosDef.columns,
        todosDef.options('draft_todos', true),
      ),
    })
  }
  ```
  </details>
</section>

<section>

  ## Sync Mode Tracking
</section>

<section>

  ## Auth Routes and Pages
</section>

<section>

  ## Default Signed-Out User
</section>

<section>

  ## User ID References in Tables
</section>

<section>

  ## Local to Sync Data Transfer
</section>

<section>

  ## Switching Sync Mode on Auth
</section>

<section>

  ## Insert Order of Operations
</section>

<section>

  ## Steps

  1. change to a "function" able schema
  2. track "sync mode" in local storage
    1.`PowersyncConnector.sessionStarted` set syncmode
    2. note that while testing it'll start off false which we don't support yet
  3. consider the UX for your auth pages and "user settings" page
  4. update your app routing `requiresAuth`
    1. also what about your default catch all
  5. depending on your tables, you may need to create a "default user" when signed out
    1.`PowersyncConnector.initialized` listener is good here
  6. `uid` or your user id column needs to be everywhere
    1. special note about firebase
    2. needs to be a value you have access to from the auth flow
  7. data transfer
    1. implementing the switch functions
      1. not all tables are created equal
      2. special note about always local-only tables
    2. switch to local on sign out
    3. sorting crud operations in the connector
    4. wait for first sync in router
    5. expand `sessionStarted` listener
</section>

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
  <label for="option-function" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="option-function" class="margin-toggle"/>
  <span class="marginnote">
    The [Sidebar] topics are more about the app and business logic steps, not PowerSync directly.
  </span>

  1. [Change your PowerSync schema creation into a function with dynamic names](#function-able-schema)
  2. [Keep track when Sync Mode is enabled or not](#sync-mode-tracking)
  3. [\[Sidebar\]: Update your routes and UX around the auth and "user setting" pages](#sidebar-auth-routes-and-pages)
  4. [\[Sidebar\]: Handle the "signed out user"](#sidebar-default-signed-out-user)
  5. [\[Sidebar\]: Add a reference to the User ID in all columns if not present](#sidebar-user-id-references-in-tables)
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
  I used these `draft_` tables for long running forms. Copy the live data into a draft table, apply user edits to it, then on save reconcile the changes. With this pattern I had an easier time dropping all changes on quit or cancel.

  <label for="repetition" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="repetition" class="margin-toggle"/>
  <span class="marginnote">
    <br><br>
    Now in spite of my lazyness, there's still a ungodly amount of repetition in this schema definition. It nags at me in the night.
    It should be possible to have this all in a loop or so while keeping the types but I haven't gotten around to it yet.
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

  Finally, make sure to update the creation of your PowerSync instance with the new schema as a function.

  ```ts
  // default to `true` so the current app keeps working
  const syncEnabled = true

  export const powersync = new PowerSyncDatabase({
    schema: makeSchema(syncEnabled),
    database: new WASQLiteOpenFactory({ dbFilename: DB_NAME }),
  })
  ```

  <details>
    <summary><h3>Bonus: Types</h3></summary>

  To get access to the type of your database and tables you can use the following:

  ```ts
  import type { makeSchema } from '/path/to/your/schema'

  export type Database = ReturnType<typeof makeSchema>['types']
  export type Tables = keyof Database

  export type TodosRecord = Database['todos']
  export type ListsRecord = Database['lists']
  ```
  </details>
</section>

<section>

  ## Sync Mode Tracking

  Your schema is now ready to work fully offline or with sync depending on the auth status.

  But like with site themes, your app needs to know the auth state as early as possible for correct bootstrap and outside of the normal auth flow so that it can always be accessed.

  That's a job for `localStorage`.

  Luckily the PowerSync example has just [what we need](https://github.com/powersync-ja/powersync-js/blob/main/demos/react-supabase-todolist-optional-sync/src/library/powersync/SyncMode.ts) so we can copy that over.

  ```ts
  const SYNC_KEY = 'syncEnabled'

  export function getSyncEnabled(dbName: string) {
    const key = `${SYNC_KEY}-${dbName}`
    const value = JSON.parse(localStorage.getItem(key) ?? 'null') as boolean | null

    if (value == null) {
      // the example has a bug here, pass the `dbName` not the key
      // otherwise you'll get `${key}-${key}-${dbName}` stored
      setSyncEnabled(dbName, false)
      return false
    }

    return value === true
  }

  export function setSyncEnabled(dbName: string, enabled: boolean) {
    const key = `${SYNC_KEY}-${dbName}`

    localStorage.setItem(key, enabled ? 'true' : 'false')
  }
  ```

  We can then put that to good use in a few places.

  ### PowerSync instance

  ```ts
  import { getSyncEnabled, setSyncEnabled } from '/path/to/syncmode'

  // Not the final resting place of this line
  setSyncEnabled(DB_NAME, true)

  const syncEnabled = getSyncEnabled(DB_NAME)

  export const powersync = new PowerSyncDatabase({
    schema: makeSchema(syncEnabled),
    database: new WASQLiteOpenFactory({ dbFilename: DB_NAME }),
  })
  ```

  ### `main.ts`

  This may look a bit weird, <label for="peak-performance" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="peak-performance" class="margin-toggle"/>
  <span class="marginnote">
    This is what peak performance looks like. Not me fighting the linter (shoutout to [Antfu's ESLint Config](https://github.com/antfu/eslint-config)).
  </span>
  but I want to avoid a top level await (even though really this is the same thing).

  ```ts
  import { getSyncEnabled } from '/path/to/syncmode'

  async function bootstrap() {
    await powersync.init()

    const connector = new PowersyncConnector(auth)
    connector.registerListener({
      // user is signed in when this is called
      sessionStarted: async (user) => {
        // STUB for now
        const isSyncMode = getSyncEnabled(powersync.database.name)
        console.warn('[TODO]: use sync mode')

        // Only connect PowerSync to Supabase when there's a signed in user
        await powersync.connect(connector)
      },
    })

    await connector.init()
  }

  void bootstrap().then(() => {
    const app = createApp(App)

    app.use(router)
    app.use(store)
    app.mount('#app')
  })
  ```

  In the `PowersyncConnector` class, you'll need to register the listener and call it as needed.

  ```ts
  // In my case I'm using Firebase for auth, if you use Supabase it should be more similar to the PowerSync docs
  // If you use something else this should help you find the places to change when using a 3rd party auth service
  import type { Auth, User } from 'firebase/auth'

  type ConnectorListener = {
    sessionStarted: (user: User) => Promise<void>
  }

  export class PowersyncConnector
    extends BaseObserver<ConnectorListener>
    implements PowerSyncBackendConnector {
    readonly sbClient: SupabaseClient

    ready: boolean

    auth: Auth

    constructor(auth: Auth) {
      super()

      this.ready = false

      this.auth = auth

      this.sbClient = createClient(
        config.supabaseUrl,
        config.supabaseAnonKey,
        {
          accessToken: async () =>
            (await this.auth.currentUser?.getIdToken(false)) ?? null,
        },
      )

      auth.onAuthStateChanged(user => this.updateUser(user))
    }

    async init() {
      if (this.ready)
        return

      await this.auth.authStateReady()
      this.updateUser(this.auth.currentUser)

      this.ready = true
    }

    updateUser(user: User | null) {
      if (user)
        this.iterateListeners(async cb => cb.sessionStarted?.(user))
    }

    // rest of the connector...
  }
  ```
</section>

<section>

  ## Sidebar: Auth Routes and Pages

  On my journey to support account free usage, there were also UX and Business Logic things to change.

  This may or may not apply to you but I bring it up here for completeness.

  There are 2 main things you need to consider.

  ### 1. Route redirection on "auth only" pages

  Like me, you probably had some pages that were meant to be accessible only to authenticated users like User Settings, or element creation, etc.

  Maybe even with a cheeky `route.meta.requiresAuth`.

  Well no longer. Now everything is accessible to everyone.

  So make sure your router redirects for these pages is updated to allow visits and remove the `requiresAuth` route meta (or your equivalent) everywhere.

  You may also want to update your catch all route. For me if someone visited `/something/thats-not-a/route`, I would redirect to the account sign up page. That no longer makes sense and is now the app homepage.

  ### 2. Unauthenticated user pages

  Finally, the User Settings page used to only be worth it for a logged in user.

  Well no longer!

  People without an account may visit this page (or not, you could keep that one locked), it's worth having a version for logged out users.

  I went with the Log in & Sign up buttons that link to the respective pages + an explanation of the point of an account.

  > ### An account is optional.
  > Mylo is free to use without an account for as long as you want.
  >
  > Logging in or creating an account lets you sync your workouts across devices.
  >
  > All your workouts and training data will be merged into your account. **You won't lose anything.**
  > <footer>The wording I've got on my Account page for signed out users.</footer>

</section>

<section>

  ## Sidebar: Default Signed-Out User

  This once again depends on your particular application.

  If you have a user table, you're likely referencing it in a few other tables and places.

  Logged out users don't have a "user" but codewise you'll want to include some logic to create a type of default user.

  Most important is giving it a User ID which you'll need to reference in all other tables, the next step.

  ```ts
    async function bootstrap() {
    await powersync.init()

    const connector = new PowersyncConnector(auth)
    connector.registerListener({
      initialized: async (user) => {
        if (user == null)
          await createUserUseCase() // here is where you create your "default" user
      },

      // user is signed in when this is called
      sessionStarted: async (user) => {
        // STUB for now
        const isSyncMode = getSyncEnabled(powersync.database.name)
        console.warn('[TODO]: use sync mode')

        await powersync.connect(connector)
      },
    })

    await connector.init()
  }
  ```

  As for the `PowersyncConnector`, you'll also need to add the `initialized` listener.

  ```ts
  type ConnectorListener = {
    // note that here the user can be `null`
    initialized: (user: User | null) => Promise<void>
    sessionStarted: (user: User) => Promise<void>
  }

  export class PowersyncConnector
    extends BaseObserver<ConnectorListener>
    implements PowerSyncBackendConnector {
    readonly sbClient: SupabaseClient

    ready: boolean

    auth: Auth

    constructor(auth: Auth) {
      super()

      this.ready = false

      this.auth = auth

      this.sbClient = createClient(
        config.supabaseUrl,
        config.supabaseAnonKey,
        {
          accessToken: async () =>
            (await this.auth.currentUser?.getIdToken(false)) ?? null,
        },
      )

      auth.onAuthStateChanged(user => this.updateUser(user))
    }

    async init() {
      if (this.ready)
        return

      await this.auth.authStateReady()
      this.updateUser(this.auth.currentUser)

      this.ready = true
      this.iterateListeners(
        async cb => cb.initialized?.(this.auth.currentUser),
      )
    }

    updateUser(user: User | null) {
      if (user)
        this.iterateListeners(async cb => cb.sessionStarted?.(user))
    }

    // rest of the connector...
  }
  ```
</section>

<section>

  ## Sidebar: User ID References in Tables

  With Supabase and row-level security, I have a policy enabling changes to a row only if the ID of the user making the request matches the `uid` row on the table.
  <label for="supabase-policy" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="supabase-policy" class="margin-toggle"/>
  <span class="marginnote">
    ⚠ The way I'm getting the `uid` here is because of Firebase Auth. Your case may be different or similar. [Who even understands JWTs?](https://datatracker.ietf.org/doc/html/rfc7519)
  </span>

  ```sql
  ALTER POLICY "Enable all for owner"
  ON "public"."<table_name>"
  TO PUBLIC
  USING ((SELECT (auth.jwt() ->> 'sub'::text)) = uid);
  ```

  It wasn't directly used in the app so I hadn't had it in my schema till now.

  For the schema switch on auth it'll be especially important to have this row defined so that the logged out data can be assigned to the user on transfer.

  ```ts
  import type { BaseColumnType } from '@powersync/web'

  import { column } from '@powersync/web'

  const listsDef = {
    columns: {
      uid: column.text as BaseColumnType<string>,
      /* other table columns */
    },
    options: (viewName: string, localOnly = false) => ({
      viewName,
      localOnly,
    }),
  }

  const todosDef = {
    columns: {
      uid: column.text as BaseColumnType<string>,
      /* other table columns */
    },
    options: (viewName: string, localOnly = false) => ({
      viewName,
      localOnly,
      /* other table options */
    }),
  }
  ```
</section>

<section>

  ## Local to Sync Data Transfer

  Now, after all this prep, lets write the meat and bones of this operation.

  After a user signs in or registers, we want to take all the data from the local tables and insert it into the synced tables.

  Then we update the `syncEnabled` state to make sure we're using these snazzy new tables.

  Finally we clear out the local tables (unless you want that data to still be present when they sign out again).

  When a user signs out, we clear everything and disable sync.

  So here's the basic approach if you have a just few tables.
  ```ts
  // powersync/switchSchema.ts

  import type { PowerSyncDatabase } from '@powersync/web'

  import { makeSchema } from './schema'
  import { setSyncEnabled } from './syncMode'

  // moved these 2 here for convenience
  export function syncedName(table: string, synced: boolean) {
    return synced ? table : `inactive_synced_${table}`
  }

  export function localName(table: string, synced: boolean) {
    return synced ? `inactive_local_${table}` : table
  }

  export async function switchToSyncedSchema(db: PowerSyncDatabase, userId: string) {
    await db.updateSchema(makeSchema(true))
    setSyncEnabled(db.database.name, true)

    await db.writeTransaction(async (trx) => {
      const todosColumns = Object.keys(todosDef.columns).toString()
      await trx.execute(`
        INSERT INTO todos(id, ${todosColumns})
        SELECT id, ${todosColumns}
        FROM ${localName('todos', true)}
      `)

      // I filter out `uid` to manually add it in the position I want for the query
      const listsColumns = Object.keys(listsDef.columns).filter(c => c !== 'uid').toString()
      await trx.execute(`
        INSERT INTO lists(id, ${listsColumns}, uid)
        SELECT id, ${listsColumns}, ?
        FROM ${localName('lists', true)}
      `, [userId])


      // clear out all local tables
      trx.execute(`DELETE FROM ${localName('todos', true)}`)
      trx.execute(`DELETE FROM ${localName('lists', true)}`)
    })
  }

  export async function switchToLocalSchema(db: PowerSyncDatabase) {
    await db.updateSchema(makeSchema(false))
    setSyncEnabled(db.database.name, false)

    await db.writeTransaction(async (trx) => {
      await Promise.all(['todos', 'lists'].map(
        async name => trx.execute(`DELETE FROM ${syncedName(name, true)}`),
      ))
    })
  }
  ```

  ### Not all tables are created equal

  In my case, I didn't have just a few tables and some were more equal than others.

  At 10 tables (double that for the `local_*` ones), I *needed* the loop.

  I also had those pesky "true local only" tables that I don't want to sync but do want to clear out.

  Finally my user tables would conflict against my Supabase constraints.

  These "lesser" tables had to go, but in slightly different ways, so I make an array of tables to exclude, and turn everything into a loop.

  First, the undesirables:
  ```ts
  /** Tables to exclude from local -> online sync. */
  export const SYNC_EXCLUDED_TABLES = [
    /** `draft_*` tables are local only and can be wiped. */
    'draft_',

    /** `inactive_*` tables are temporary copies to ignore. */
    'inactive_',

    /** The local user is discarded to prevent sync conflicts. */
    'users',
  ]

  /** Tables to exclude from purge during auth state switch. */
  export const DELETE_EXCLUDED_TABLES = [
    /** `inactive_*` tables are temporary copies to ignore. */
    'inactive_',

    /** `draft_*` tables are local only and can be wiped. */
    'draft_',

    // We DO want to clear the local user table
    // 'users',
  ]
  ```

  Now all loopified:
  <label for="metaphor" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="metaphor" class="margin-toggle"/>
  <span class="marginnote">
    There's also that `uid` column on every table that I want to treat extra special.
  </span>

  ```ts
  // powersync/switchSchema.ts

  import type { PowerSyncDatabase } from '@powersync/web'

  import { DELETE_EXCLUDED_TABLES, SYNC_EXCLUDED_TABLES } from './constants'
  import { makeSchema } from './schema'
  import { setSyncEnabled } from './syncMode'

  export function syncedName(table: string, synced: boolean) {
    return synced ? table : `inactive_synced_${table}`
  }

  export function localName(table: string, synced: boolean) {
    return synced ? `inactive_local_${table}` : table
  }

  export async function switchToSyncedSchema(db: PowerSyncDatabase, userId: string) {
    await db.updateSchema(makeSchema(true))
    setSyncEnabled(db.database.name, true)

    await db.writeTransaction(async (trx) => {
      const tableNames = db.schema.tables
        .filter(t => SYNC_EXCLUDED_TABLES.every(ex => !t.viewName.startsWith(ex)))
        .map(t => ({
          sync: t.viewName,
          local: localName(t.viewName, true),
          columns: Object.keys(t.columnMap).filter(c => c !== 'uid'),
        }))

      // manually add `id`, it's there by default but not in the table definitions
      // adding `uid` at the end to make sure of the order
      await Promise.all(tableNames.map(async t => trx.execute(`
        INSERT INTO ${t.sync}(id, ${t.columns.toString()}, uid)
        SELECT id, ${t.columns.toString()}, ?
        FROM ${t.local}
      `, [userId])))

      // clear out all local tables
      const localOnlyTables = db.schema.tables
        .filter(t => DELETE_EXCLUDED_TABLES.every(ex => !t.viewName.startsWith(ex)))
        .map(t => localName(t.viewName, true))
      await Promise.all(localOnlyTables.map(async name => trx.execute(`DELETE FROM ${name}`)))
    })
  }

  export async function switchToLocalSchema(db: PowerSyncDatabase) {
    await db.updateSchema(makeSchema(false))
    setSyncEnabled(db.database.name, false)

    await db.writeTransaction(async (trx) => {
      const syncTables = db.schema.tables
        .filter(t => DELETE_EXCLUDED_TABLES.every(ex => !t.viewName.startsWith(ex)))
        .map(t => syncedName(t.viewName, true))
      await Promise.all(syncTables.map(async name => trx.execute(`DELETE FROM ${name}`)))
    })
  }
  ```

  Presto! We're ready to wire all this up.
</section>

<section>

  ## Switching Sync Mode on Auth

  Now lets do the skin and hair of this operation!
  <label for="metaphor" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="metaphor" class="margin-toggle"/>
  <span class="marginnote">
    How's my metaphor extension?
    <br>
    Call 1-800-888-8888
  </span>

  So where are we at now?
  * Tables are ready
  * Schema is parametric
  * Data switching is set up
  * We know whether to sync or not

  Now we orchestrate all these elements together.

  ### 0. In PowerSync init

  Now that things will be wired up, we can forego the hardcoded value.

  ```ts
  const syncEnabled = getSyncEnabled(DB_NAME)

  export const powersync = new PowerSyncDatabase({
    schema: makeSchema(syncEnabled),
    database: new WASQLiteOpenFactory({ dbFilename: DB_NAME }),
  })
  ```

  ### 1. On sign in or register

  Here we have a newly authenticated user while still being in sync mode off.

  That means it's time to switch to sync mode and transfer the data.
  ```ts
  // main.ts

  sessionStarted: async (user) => {
    const isSyncMode = getSyncEnabled(powersync.database.name)
    if (isSyncMode === false)
      await switchToSyncedSchema(powersync, user.uid)

    await powersync.connect(connector)
  },
  ```

  ### 2. On sign out

  Wherever you've got your sign out logic, you'll want to then switch back to local tables and turn sync mode off.

  Here's what that looks like for me.

  ```ts
  import { auth } from '@/features/auth'
  import { powersync, switchToLocalSchema } from '@/libraries/powersync'

  export async function signOutUserUseCase() {
    if (auth.currentUser == null)
      throw new Error('Unable to logout.')

    await powersync.disconnectAndClear()
    await switchToLocalSchema(powersync)
    await auth.signOut()

    // this erases the sync mode key but it gets initialized to `false` so all good
    localStorage.clear()

    window.location.reload()
  }
  ```

  ### Sidebar: In the router

  Now here is a Vue-ism so your version may vary.

  I found that waiting for the first database sync prevented a blank loading page which isn't very local-first or it loaded partial data until a refresh.

  ```ts
  router.beforeEach(async (to) => {
    if (auth.currentUser != null)
      await database.waitForFirstSync()

    // rest of your router guard logic...
  })
  ```

  And that's it!

  We set up all the dominoes and got to watch them fall (which always happens much faster than the setup).
</section>

<section>

  ## Insert Order of Operations
</section>

<section>

  ## Conclusion
</section>

<script>
	import {setURL, doLogin, doQuery} from './cbwsclient.svelte';
	export let name;
	export let iname;
	function handlePress(val) {
		iname = val;
		document.getElementById('listaccs').accounts=getAccounts(val);
	}
	async function getAccounts(search) {
		await doQuery("select id,accountname from Accounts where accountname like '%"+search+"%';");
	}
	setURL('http://demo.corebos.com');
	doLogin('admin', 'admin', true);
</script>

<main>
	<h1>Hello {name}!</h1>
	<p>Type to autocomplete in coreBOS</p>
	<input name="svelte" bind:value={iname}>
	<p>Searching for {iname}</p>
	{#await doQuery("select id,accountname from Accounts where accountname like '%"+iname+"%';")}
		<p>...waiting</p>
	{:then accounts}
		<table style="margin:auto;">
			{#each accounts as account}
				<tr><td>
					<a target="_blank" href="http://demo.corebos.com/index.php?action=DetailView&module=Accounts&record={account.id.substr(3)}">
					{account.accountname}
					</a>
				</td></tr>
			{/each}
		</table>
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
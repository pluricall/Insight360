import { Client } from 'ldapts';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: "Username é obrigatório" }, { status: 400 });
    }

    const client = new Client({
      url: "ldap://earth.pluricall.local",
    });

    await client.bind("administrator@pluricall.local", "cassini*06");

    const { searchEntries } = await client.search("DC=pluricall,DC=local", {
      filter: `(sAMAccountName=${username})`,
      scope: "sub",
      attributes: ["dn", "cn", "mail"],
    });

    await client.unbind();

    if (searchEntries.length > 0) {
      return NextResponse.json({ exists: true, user: searchEntries[0] }, { status: 200 });
    } else {
      return NextResponse.json({ exists: false }, { status: 200 });
    }
  } catch (err: any) {
    console.error("Erro LDAP:", err);
    return NextResponse.json({ error: "Erro ao consultar LDAP" }, { status: 500 });
  }
}
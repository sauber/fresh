import LemonIcon from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/lemon-2.tsx";

type Props = {
  active: string;
};

export default function Header({ active }: Props) {
  const menus = [
    { name: "Home", href: "/" },
    { name: "Discover", href: "/discover" },
    { name: "Docs", href: "/docs" },
  ];

  return (
    <div class="navbar">
      <ul class="navbar-nav">
        {menus.map((menu) => (
          <li class="nav-item">
            <a
              href={menu.href}
              class={"nav-link" +
                (menu.href === active ? " font-bold border-b-2" : "")}
            >
              {menu.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
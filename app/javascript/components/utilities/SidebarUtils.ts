const SidebarUtils = {
    handleSidebarCollpaseBug: () => {
        const sidebarMenu = document.getElementById("sidebar-menu");
        setTimeout(() => {
            if (sidebarMenu) {
                sidebarMenu.classList.remove("ant-menu-inline");
                sidebarMenu.classList.add("ant-menu-vertical");

                const menuItems = sidebarMenu.querySelectorAll(".ant-menu-item") as unknown as HTMLElement[];
                menuItems.forEach((menuItem) => {
                    menuItem.style.removeProperty("padding-left");
                });

                const submenuItems = sidebarMenu.querySelectorAll(
                    ".ant-menu-submenu .ant-menu-submenu-title"
                ) as unknown as HTMLElement[];
                submenuItems.forEach((submenuItem) => {
                    submenuItem.style.removeProperty("padding-left");
                });
            }
        });
    }
};

export { SidebarUtils };

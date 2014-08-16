using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace coreBOSNet
{
    public partial class FrmUser : Form
    {
        public string user_name = "";
        public string key = "";
        public string url = "";

        public FrmUser()
        {
            InitializeComponent();
        }

        private void btnOk_Click(object sender, EventArgs e)
        {
            if (txtUserName.Text != "" && txtKey.Text != ""){
                this.user_name = txtUserName.Text;
                this.key = txtKey.Text;
                this.url = txtURL.Text;
                this.DialogResult = System.Windows.Forms.DialogResult.OK;
            }
            else { 
                MessageBox.Show(this, "Datos incorrectos", Application.ProductName, 
                    MessageBoxButtons.OK, MessageBoxIcon.Error); 
            }
        }

        private void btnCancel_Click(object sender, EventArgs e)
        {
            this.DialogResult = System.Windows.Forms.DialogResult.Cancel;
        }
    }
}

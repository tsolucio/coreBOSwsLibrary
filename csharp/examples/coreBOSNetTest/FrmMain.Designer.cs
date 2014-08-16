namespace coreBOSNet
{
    partial class FrmMain
    {
        /// <summary>
        /// Variable del diseñador requerida.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Limpiar los recursos que se estén utilizando.
        /// </summary>
        /// <param name="disposing">true si los recursos administrados se deben desechar; false en caso contrario.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Código generado por el Diseñador de Windows Forms

        /// <summary>
        /// Método necesario para admitir el Diseñador. No se puede modificar
        /// el contenido del método con el editor de código.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(FrmMain));
            this.tBar = new System.Windows.Forms.ToolStrip();
            this.btnLogin = new System.Windows.Forms.ToolStripButton();
            this.btnDisconnect = new System.Windows.Forms.ToolStripButton();
            this.toolStripSeparator1 = new System.Windows.Forms.ToolStripSeparator();
            this.btnQuery = new System.Windows.Forms.ToolStripButton();
            this.stBar = new System.Windows.Forms.StatusStrip();
            this.toolStripStatusLabel1 = new System.Windows.Forms.ToolStripStatusLabel();
            this.lbStatusConnection = new System.Windows.Forms.ToolStripStatusLabel();
            this.toolStripStatusLabel2 = new System.Windows.Forms.ToolStripStatusLabel();
            this.lbUserName = new System.Windows.Forms.ToolStripStatusLabel();
            this.lstData = new System.Windows.Forms.ListView();
            this.tBar.SuspendLayout();
            this.stBar.SuspendLayout();
            this.SuspendLayout();
            // 
            // tBar
            // 
            this.tBar.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.btnLogin,
            this.btnDisconnect,
            this.toolStripSeparator1,
            this.btnQuery});
            this.tBar.Location = new System.Drawing.Point(0, 0);
            this.tBar.Name = "tBar";
            this.tBar.Size = new System.Drawing.Size(662, 52);
            this.tBar.TabIndex = 1;
            this.tBar.Text = "tBar";
            // 
            // btnLogin
            // 
            this.btnLogin.Image = ((System.Drawing.Image)(resources.GetObject("btnLogin.Image")));
            this.btnLogin.ImageScaling = System.Windows.Forms.ToolStripItemImageScaling.None;
            this.btnLogin.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.btnLogin.Name = "btnLogin";
            this.btnLogin.Size = new System.Drawing.Size(36, 49);
            this.btnLogin.Text = "Login";
            this.btnLogin.TextImageRelation = System.Windows.Forms.TextImageRelation.ImageAboveText;
            this.btnLogin.Click += new System.EventHandler(this.btnLogin_Click);
            // 
            // btnDisconnect
            // 
            this.btnDisconnect.Enabled = false;
            this.btnDisconnect.Image = ((System.Drawing.Image)(resources.GetObject("btnDisconnect.Image")));
            this.btnDisconnect.ImageScaling = System.Windows.Forms.ToolStripItemImageScaling.None;
            this.btnDisconnect.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.btnDisconnect.Name = "btnDisconnect";
            this.btnDisconnect.Size = new System.Drawing.Size(44, 49);
            this.btnDisconnect.Text = "Logout";
            this.btnDisconnect.TextImageRelation = System.Windows.Forms.TextImageRelation.ImageAboveText;
            this.btnDisconnect.Click += new System.EventHandler(this.btnDisconnect_Click);
            // 
            // toolStripSeparator1
            // 
            this.toolStripSeparator1.Name = "toolStripSeparator1";
            this.toolStripSeparator1.Size = new System.Drawing.Size(6, 52);
            // 
            // btnQuery
            // 
            this.btnQuery.Enabled = false;
            this.btnQuery.Image = ((System.Drawing.Image)(resources.GetObject("btnQuery.Image")));
            this.btnQuery.ImageScaling = System.Windows.Forms.ToolStripItemImageScaling.None;
            this.btnQuery.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.btnQuery.Name = "btnQuery";
            this.btnQuery.Size = new System.Drawing.Size(41, 49);
            this.btnQuery.Text = "Query";
            this.btnQuery.TextImageRelation = System.Windows.Forms.TextImageRelation.ImageAboveText;
            this.btnQuery.Click += new System.EventHandler(this.btnQuery_Click);
            // 
            // stBar
            // 
            this.stBar.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.toolStripStatusLabel1,
            this.lbStatusConnection,
            this.toolStripStatusLabel2,
            this.lbUserName});
            this.stBar.Location = new System.Drawing.Point(0, 444);
            this.stBar.Name = "stBar";
            this.stBar.Size = new System.Drawing.Size(662, 22);
            this.stBar.TabIndex = 2;
            this.stBar.Text = "stBar";
            // 
            // toolStripStatusLabel1
            // 
            this.toolStripStatusLabel1.Font = new System.Drawing.Font("Tahoma", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.toolStripStatusLabel1.Name = "toolStripStatusLabel1";
            this.toolStripStatusLabel1.Size = new System.Drawing.Size(51, 17);
            this.toolStripStatusLabel1.Text = "Estado :";
            // 
            // lbStatusConnection
            // 
            this.lbStatusConnection.Name = "lbStatusConnection";
            this.lbStatusConnection.Size = new System.Drawing.Size(75, 17);
            this.lbStatusConnection.Text = "Desconectado";
            // 
            // toolStripStatusLabel2
            // 
            this.toolStripStatusLabel2.Font = new System.Drawing.Font("Tahoma", 8.25F, System.Drawing.FontStyle.Bold);
            this.toolStripStatusLabel2.Name = "toolStripStatusLabel2";
            this.toolStripStatusLabel2.Size = new System.Drawing.Size(42, 17);
            this.toolStripStatusLabel2.Text = "User : ";
            // 
            // lbUserName
            // 
            this.lbUserName.Name = "lbUserName";
            this.lbUserName.Size = new System.Drawing.Size(11, 17);
            this.lbUserName.Text = ".";
            // 
            // lstData
            // 
            this.lstData.Dock = System.Windows.Forms.DockStyle.Fill;
            this.lstData.FullRowSelect = true;
            this.lstData.GridLines = true;
            this.lstData.Location = new System.Drawing.Point(0, 52);
            this.lstData.Name = "lstData";
            this.lstData.Size = new System.Drawing.Size(662, 392);
            this.lstData.TabIndex = 5;
            this.lstData.UseCompatibleStateImageBehavior = false;
            this.lstData.View = System.Windows.Forms.View.Details;
            // 
            // FrmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(662, 466);
            this.Controls.Add(this.lstData);
            this.Controls.Add(this.stBar);
            this.Controls.Add(this.tBar);
            this.Name = "FrmMain";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "coreBOS Test v1.0";
            this.tBar.ResumeLayout(false);
            this.tBar.PerformLayout();
            this.stBar.ResumeLayout(false);
            this.stBar.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.ToolStrip tBar;
        private System.Windows.Forms.ToolStripButton btnLogin;
        private System.Windows.Forms.ToolStripButton btnDisconnect;
        private System.Windows.Forms.StatusStrip stBar;
        private System.Windows.Forms.ToolStripStatusLabel toolStripStatusLabel1;
        private System.Windows.Forms.ToolStripStatusLabel lbStatusConnection;
        private System.Windows.Forms.ToolStripStatusLabel toolStripStatusLabel2;
        private System.Windows.Forms.ToolStripStatusLabel lbUserName;
        private System.Windows.Forms.ToolStripSeparator toolStripSeparator1;
        private System.Windows.Forms.ToolStripButton btnQuery;
        private System.Windows.Forms.ListView lstData;
    }
}

